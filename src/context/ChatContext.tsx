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
import { ChatApiService } from "@/src/services/chatService";
import { ChatConnectionState, ChatMessage, ChatUser, WsEvent } from "@/src/model/chat.types";
import { ChatContextValue } from "@/src/model/ws.types";
import { chatWebSocket } from "@/src/ws/chatWebSocket";

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

  const currentUserRef = useRef<ChatUser | null>(null);
  const tokenRef = useRef<string | null>(null);
  const cleanupWsRef = useRef<(() => void) | null>(null);

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
          _connectWs(savedToken);
        }
      } catch {}
      finally {
        setIsLoadingSession(false);
      }
    };
    void restoreSession();
  }, []);

  const handleWsEvent = useCallback((event: WsEvent) => {
    switch (event.type) {
      case "group_history":
        setGroupMessages(event.messages);
        break;
      case "group_message":
        setGroupMessages((prev) => [...prev, event.message]);
        break;
      case "dm": {
        const msg = event.message;
        const myId = currentUserRef.current?.id;
        const otherId = msg.sender_id === myId ? msg.recipient_id! : msg.sender_id;
        setDirectMessages((prev) => ({
          ...prev,
          [otherId]: [...(prev[otherId] ?? []), msg],
        }));
        break;
      }
      case "users_list":
        setOnlineUsers(event.users);
        break;
      case "user_joined":
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
  }, []);

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
    setToken(null);
    setCurrentUser(null);
    setConnectionState("idle");
    setOnlineUsers([]);
    setGroupMessages([]);
    setDirectMessages({});
    setTypingUsers({});
  }, []);

  const sendGroupMessage = useCallback((content: string) => {
    chatWebSocket.sendGroupMessage(content);
  }, []);

  const sendDirectMessage = useCallback((toUserId: string, content: string) => {
    chatWebSocket.sendDM(toUserId, content);
  }, []);

  const loadDirectMessages = useCallback(async (otherUserId: string) => {
    if (!tokenRef.current) return;
    try {
      const history = await ChatApiService.getDMHistory(otherUserId, tokenRef.current);
      setDirectMessages((prev) => ({ ...prev, [otherUserId]: history }));
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
