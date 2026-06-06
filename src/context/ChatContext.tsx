import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
import { ChatApiService } from "@/src/services/chatService";
import { ChatConnectionState, ChatMessage, ChatUser, WsEvent } from "@/src/model/chat.types";
import { ChatContextValue } from "@/src/model/ws.types";
import { chatWebSocket } from "@/src/ws/chatWebSocket";
import { generateKeyPair, encryptGroup, decryptGroup, encryptDM, decryptDM } from "@/src/utils/crypto";
import { saveKeyPair, loadKeyPair } from "@/src/utils/storage";

const ChatContext = createContext<ChatContextValue | null>(null);

const STORAGE_KEY_USER = "@chat_user";
const STORAGE_KEY_TOKEN = "@chat_token";

export function ChatProvider({ children }: { children: ReactNode | ReactNode[] }) {
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [connectionState, setConnectionState] = useState<ChatConnectionState>("idle");
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [groupMessages, setGroupMessages] = useState<ChatMessage[]>([]);
  const [directMessages, setDirectMessages] = useState<Record<string, ChatMessage[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  // Encryption state
  const [groupKey, setGroupKey] = useState<string | null>(null);
  const [userPublicKeys, setUserPublicKeys] = useState<Record<string, string>>({});
  const [myKeyPair, setMyKeyPair] = useState<{ publicKey: string | null; secretKey: string | null }>({
    publicKey: null,
    secretKey: null,
  });

  const currentUserRef = useRef<ChatUser | null>(null);
  const tokenRef = useRef<string | null>(null);
  const cleanupWsRef = useRef<(() => void) | null>(null);
  // Refs for stable access inside WS callbacks without stale closures
  const groupKeyRef = useRef<string | null>(null);
  const userPublicKeysRef = useRef<Record<string, string>>({});
  const myKeyPairRef = useRef<{ publicKey: string | null; secretKey: string | null }>({ publicKey: null, secretKey: null });
  // Raw encrypted group history — decrypted once groupKey arrives
  const rawGroupHistoryRef = useRef<ChatMessage[] | null>(null);

  useEffect(() => { groupKeyRef.current = groupKey; }, [groupKey]);
  useEffect(() => { userPublicKeysRef.current = userPublicKeys; }, [userPublicKeys]);
  useEffect(() => { myKeyPairRef.current = myKeyPair; }, [myKeyPair]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [savedSession, savedToken] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_USER),
          AsyncStorage.getItem(STORAGE_KEY_TOKEN),
        ]);
        if (savedSession && savedToken) {
          const savedUser = JSON.parse(savedSession) as ChatUser;
          currentUserRef.current = savedUser;
          tokenRef.current = savedToken;
          setCurrentUser(savedUser);
          setToken(savedToken);

          const kp = await loadKeyPair();
          if (kp.secretKey && kp.publicKey) {
            myKeyPairRef.current = kp;
            setMyKeyPair(kp);
          }

          _connectWs(savedToken);
        }
      } catch {}
      finally {
        setIsLoadingSession(false);
      }
    };
    void restoreSession();
  }, []);

  const _decryptGroupMessages = useCallback((messages: ChatMessage[], key: string): ChatMessage[] => {
    return messages.map((m) => {
      const plain = decryptGroup(m.content, key);
      return plain != null ? { ...m, content: plain } : { ...m, content: "[mensaje no descifrable]" };
    });
  }, []);

  const handleWsEvent = useCallback((event: WsEvent) => {
    switch (event.type) {
      case "group_history":
        // group_key arrives after group_history — store raw; decrypt when key arrives
        rawGroupHistoryRef.current = event.messages;
        if (groupKeyRef.current) {
          setGroupMessages(_decryptGroupMessages(event.messages, groupKeyRef.current));
        } else {
          setGroupMessages(event.messages);
        }
        break;

      case "group_key": {
        const key = event.key;
        groupKeyRef.current = key;
        setGroupKey(key);
        // Decrypt pending history if it arrived before the key
        if (rawGroupHistoryRef.current) {
          setGroupMessages(_decryptGroupMessages(rawGroupHistoryRef.current, key));
          rawGroupHistoryRef.current = null;
        }
        break;
      }

      case "group_message": {
        const plain = groupKeyRef.current
          ? decryptGroup(event.message.content, groupKeyRef.current)
          : null;
        setGroupMessages((prev) => [
          ...prev,
          { ...event.message, content: plain ?? "[mensaje no descifrable]" },
        ]);
        break;
      }

      case "dm": {
        const msg = event.message;
        const myId = currentUserRef.current?.id;
        const otherId = msg.sender_id === myId ? msg.recipient_id! : msg.sender_id;
        const senderKey = userPublicKeysRef.current[msg.sender_id];
        const plain =
          senderKey && myKeyPairRef.current.secretKey
            ? decryptDM(msg.content, senderKey, myKeyPairRef.current.secretKey)
            : null;
        setDirectMessages((prev) => ({
          ...prev,
          [otherId]: [...(prev[otherId] ?? []), { ...msg, content: plain ?? "[mensaje no descifrable]" }],
        }));
        break;
      }

      case "users_list":
        setUserPublicKeys((prev) => {
          const updated = { ...prev };
          event.users.forEach((u) => {
            if (u.public_key) updated[u.id] = u.public_key;
          });
          userPublicKeysRef.current = updated;
          return updated;
        });
        setOnlineUsers(event.users);
        break;

      case "user_joined":
        if (event.user.public_key) {
          setUserPublicKeys((prev) => {
            const updated = { ...prev, [event.user.id]: event.user.public_key! };
            userPublicKeysRef.current = updated;
            return updated;
          });
        }
        setOnlineUsers((prev) => {
          const exists = prev.some((u) => u.id === event.user.id);
          return exists ? prev : [...prev, event.user];
        });
        break;

      case "user_left":
        setOnlineUsers((prev) => prev.filter((u) => u.id !== event.user_id));
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[event.user_id];
          return next;
        });
        break;

      case "typing":
        setTypingUsers((prev) => ({ ...prev, [event.user_id]: event.nickname }));
        break;

      case "stop_typing":
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[event.user_id];
          return next;
        });
        break;

      case "message_expired":
        setGroupMessages((prev) => prev.filter((m) => m.id !== event.message_id));
        setDirectMessages((prev) => {
          const next: Record<string, ChatMessage[]> = {};
          for (const [key, msgs] of Object.entries(prev)) {
            next[key] = msgs.filter((m) => m.id !== event.message_id);
          }
          return next;
        });
        break;

      case "error":
        console.warn("Chat WS error:", event.message);
        break;

      default:
        break;
    }
  }, [_decryptGroupMessages]);

  const _connectWs = useCallback(
    (wsToken: string) => {
      cleanupWsRef.current?.();
      cleanupWsRef.current = null;

      setConnectionState("connecting");

      const unSubEvent = chatWebSocket.onEvent(handleWsEvent);
      const unSubConnect = chatWebSocket.onConnect(() => setConnectionState("connected"));
      const unSubDisconnect = chatWebSocket.onDisconnect(() => setConnectionState("disconnected"));

      chatWebSocket.connect(wsToken);

      cleanupWsRef.current = () => {
        unSubEvent();
        unSubConnect();
        unSubDisconnect();
      };
    },
    [handleWsEvent],
  );

  const joinChat = useCallback(
    async (nickname: string) => {
      const { user, token: newToken } = await ChatApiService.join(nickname);
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEY_TOKEN, newToken),
      ]);
      currentUserRef.current = user;
      tokenRef.current = newToken;
      setCurrentUser(user);
      setToken(newToken);

      // Load or generate key pair
      let kp = await loadKeyPair();
      if (!kp.secretKey || !kp.publicKey) {
        const generated = generateKeyPair();
        await saveKeyPair(generated);
        kp = generated;
      }
      myKeyPairRef.current = kp;
      setMyKeyPair(kp);

      // Register public key before connecting WS
      await ChatApiService.registerPublicKey(newToken, kp.publicKey!);

      _connectWs(newToken);
    },
    [_connectWs],
  );

  const leaveChat = useCallback(async () => {
    cleanupWsRef.current?.();
    cleanupWsRef.current = null;
    chatWebSocket.disconnect();
    if (tokenRef.current) {
      try { await ChatApiService.logout(tokenRef.current); } catch {}
    }
    await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_USER]);
    currentUserRef.current = null;
    tokenRef.current = null;
    rawGroupHistoryRef.current = null;
    groupKeyRef.current = null;
    userPublicKeysRef.current = {};
    myKeyPairRef.current = { publicKey: null, secretKey: null };
    setToken(null);
    setCurrentUser(null);
    setConnectionState("idle");
    setOnlineUsers([]);
    setGroupMessages([]);
    setDirectMessages({});
    setTypingUsers({});
    setGroupKey(null);
    setUserPublicKeys({});
    setMyKeyPair({ publicKey: null, secretKey: null });
  }, []);

  const sendGroupMessage = useCallback((content: string) => {
    const key = groupKeyRef.current;
    if (!key) return;
    const ciphertext = encryptGroup(content, key);
    if (ciphertext.length > 1000) {
      Alert.alert("Mensaje demasiado largo", "Acorta el mensaje e intenta de nuevo.");
      return;
    }
    chatWebSocket.sendGroupMessage(ciphertext);
  }, []);

  const sendDirectMessage = useCallback((toUserId: string, content: string) => {
    const recipientKey = userPublicKeysRef.current[toUserId];
    const secretKey = myKeyPairRef.current.secretKey;
    if (!recipientKey || !secretKey) return;
    const ciphertext = encryptDM(content, recipientKey, secretKey);
    if (ciphertext.length > 1000) {
      Alert.alert("Mensaje demasiado largo", "Acorta el mensaje e intenta de nuevo.");
      return;
    }
    chatWebSocket.sendDM(toUserId, ciphertext);
  }, []);

  const loadDirectMessages = useCallback(async (otherUserId: string) => {
    if (!tokenRef.current) return;
    try {
      const history = await ChatApiService.getDMHistory(otherUserId, tokenRef.current);
      // Decrypt DM history
      const secretKey = myKeyPairRef.current.secretKey;
      const senderKey = userPublicKeysRef.current[otherUserId];
      const decrypted = history.map((m) => {
        if (!secretKey || !senderKey) return m;
        const plain = decryptDM(m.content, senderKey, secretKey);
        return plain != null ? { ...m, content: plain } : { ...m, content: "[mensaje no descifrable]" };
      });
      setDirectMessages((prev) => ({ ...prev, [otherUserId]: decrypted }));
    } catch {}
  }, []);

  const sendTyping = useCallback((toUserId?: string) => {
    chatWebSocket.sendTyping(toUserId);
  }, []);

  const stopTyping = useCallback(() => {
    chatWebSocket.stopTyping();
  }, []);

  const markRead = useCallback((messageId: string) => {
    chatWebSocket.markRead(messageId);
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      currentUser,
      token,
      isLoadingSession,
      connectionState,
      onlineUsers,
      groupMessages,
      directMessages,
      typingUsers,
      joinChat,
      leaveChat,
      sendGroupMessage,
      sendDirectMessage,
      loadDirectMessages,
      sendTyping,
      stopTyping,
      markRead,
    }),
    [
      currentUser, token, isLoadingSession, connectionState,
      onlineUsers, groupMessages, directMessages, typingUsers,
      joinChat, leaveChat, sendGroupMessage, sendDirectMessage,
      loadDirectMessages, sendTyping, stopTyping, markRead,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext debe usarse dentro de ChatProvider");
  return ctx;
}
