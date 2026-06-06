import { useAuth } from "@/src/context/AuthContext";
import { useChatContext } from "@/src/context/ChatContext";
import { ChatMessage } from "@/src/model/chat.types";
import { AppTheme, getAppTheme, useProfileTheme } from "@/src/theme/designSystem";
import { DateUtil } from "@/src/utils/dateUtil";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ScreenChat() {
  const insets = useSafeAreaInsets();
  const { theme, styles } = useProfileTheme(stylesByMode);

  const { user, profile } = useAuth();
  const {
    groupMessages,
    currentUser,
    onlineUsers,
    connectionState,
    isLoadingSession,
    sendGroupMessage,
    joinChat,
  } = useChatContext();

  const [message, setMessage] = useState("");
  const [joining, setJoining] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-join usando el usuario de Firebase Auth — sin modal de email
  useEffect(() => {
    if (!isLoadingSession && !currentUser && user && !joining) {
      const nickname =
        profile?.username?.trim() || user.email?.split("@")[0] || "usuario";
      setJoining(true);
      joinChat(nickname)
        .catch(console.error)
        .finally(() => setJoining(false));
    }
  }, [isLoadingSession, currentUser, user, profile, joinChat, joining]);

  // Auto-scroll al recibir nuevos mensajes
  useEffect(() => {
    if (groupMessages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [groupMessages.length]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendGroupMessage(message.trim());
    setMessage("");
  };

  const isIncoming = (msg: ChatMessage) => msg.sender_id !== currentUser?.id;

  if (isLoadingSession || joining || !currentUser) {
    return (
      <View
        style={[
          styles.centered,
          { paddingTop: insets.top, backgroundColor: theme.colors.bgPrimary },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.accentGreen} />
        <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>
          Conectando al chat...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {connectionState === "disconnected" && (
        <View
          style={[
            styles.warnBanner,
            {
              backgroundColor: theme.colors.categories.yellow.bg,
              borderColor: theme.colors.categories.yellow.border,
            },
          ]}
        >
          <Text style={[styles.warnText, { color: theme.colors.categories.yellow.border }]}>
            Reconectando...
          </Text>
        </View>
      )}

      <View style={[styles.header, { borderBottomColor: theme.colors.borderPrimary }]}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.accentGreen }]}>
          <Text style={styles.avatarText}>G</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            GardenGenie Chat
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textTertiary }]}>
            {onlineUsers.length} {onlineUsers.length === 1 ? "conectado" : "conectados"}
          </Text>
        </View>
      </View>

      {/* adjustResize en AndroidManifest maneja el teclado en Android — KAV solo necesario en iOS */}
      <View style={styles.flex}>
        <ScrollView
          style={styles.flex}
          ref={scrollRef}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: insets.bottom + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.dayLabel, { color: theme.colors.textTertiary }]}>
            Hoy
          </Text>

          {groupMessages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isIncoming(msg) ? styles.incomingRow : styles.outgoingRow,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isIncoming(msg)
                    ? [styles.incomingBubble, { backgroundColor: theme.colors.bgSecondary }]
                    : [
                        styles.outgoingBubble,
                        {
                          backgroundColor:
                            theme.mode === "dark" ? "#14532d" : "#d1fae5",
                        },
                      ],
                ]}
              >
                {isIncoming(msg) && (
                  <Text style={[styles.senderName, { color: theme.colors.accentGreen }]}>
                    {msg.sender_nickname}
                  </Text>
                )}
                <Text style={[styles.messageText, { color: theme.colors.textPrimary }]}>
                  {msg.content}
                </Text>
                <Text style={[styles.messageTime, { color: theme.colors.textTertiary }]}>
                  {DateUtil.getHour(msg.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View
          style={[
            styles.composerWrapper,
            {
              backgroundColor: theme.colors.bgSecondary,
              borderTopColor: theme.colors.borderPrimary,
            },
          ]}
        >
          <View style={[styles.composer, { borderColor: theme.colors.borderPrimary }]}>
            <TextInput
              multiline
              value={message}
              onChangeText={setMessage}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={theme.colors.textTertiary}
              style={[styles.input, { color: theme.colors.textPrimary }]}
            />
            <Pressable
              disabled={!message.trim()}
              onPress={handleSend}
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.colors.accentGreen,
                  opacity: message.trim() ? 1 : 0.4,
                },
              ]}
            >
              <Text style={styles.sendButtonText}>Enviar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.bgPrimary,
    },
    flex: { flex: 1 },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    loadingText: {
      fontSize: theme.fontSize.sm,
    },
    warnBanner: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      borderBottomWidth: 1,
      alignItems: "center",
    },
    warnText: {
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      gap: theme.spacing.md,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: "#ffffff",
      fontSize: theme.fontSize.md,
      fontWeight: "700",
    },
    headerCopy: { gap: 2 },
    headerTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: "700",
    },
    headerSubtitle: {
      fontSize: theme.fontSize.sm,
    },
    messagesContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    dayLabel: {
      alignSelf: "center",
      fontSize: theme.fontSize.sm,
      fontWeight: "600",
      textTransform: "uppercase",
      marginBottom: theme.spacing.xs,
    },
    messageRow: {
      width: "100%",
      flexDirection: "row",
    },
    incomingRow: { justifyContent: "flex-start" },
    outgoingRow: { justifyContent: "flex-end" },
    bubble: {
      maxWidth: "82%",
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
      borderRadius: theme.radius.lg,
    },
    incomingBubble: { borderBottomLeftRadius: theme.radius.xs },
    outgoingBubble: { borderBottomRightRadius: theme.radius.xs },
    senderName: {
      fontSize: 11,
      fontWeight: "600",
      marginBottom: 2,
    },
    messageText: {
      fontSize: theme.fontSize.sm,
      lineHeight: 20,
    },
    messageTime: {
      fontSize: 11,
      fontWeight: "600",
      textAlign: "right",
      marginTop: theme.spacing.xs,
    },
    composerWrapper: {
      borderTopWidth: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
    },
    composer: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 52,
      borderWidth: 1,
      borderRadius: theme.radius.full,
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.xs,
    },
    input: {
      flex: 1,
      fontSize: theme.fontSize.sm,
      paddingVertical: theme.spacing.sm,
      paddingRight: theme.spacing.md,
      maxHeight: 120,
    },
    sendButton: {
      minWidth: 80,
      height: 38,
      borderRadius: theme.radius.full,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.md,
    },
    sendButtonText: {
      color: "#ffffff",
      fontSize: theme.fontSize.sm,
      fontWeight: "700",
    },
  });

const stylesByMode = {
  light: createStyles(getAppTheme("light")),
  dark: createStyles(getAppTheme("dark")),
};
