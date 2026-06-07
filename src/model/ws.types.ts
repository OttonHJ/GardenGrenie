import { ChatConnectionState, ChatMessage, ChatUser, WsEvent } from "@/src/model/chat.types";

export type EventHandlerWs = (event: WsEvent) => void;
export type StatusHandlerWs = () => void;

export interface ChatContextValue {
  currentUser: ChatUser | null;
  token: string | null;
  isLoadingSession: boolean;
  connectionState: ChatConnectionState;
  onlineUsers: ChatUser[];
  groupMessages: ChatMessage[];
  directMessages: Record<string, ChatMessage[]>;
  typingUsers: Record<string, string>;
  joinChat: (nickName: string) => Promise<void>;
  leaveChat: () => Promise<void>;
  sendGroupMessage: (content: string) => void;
  sendDirectMessage: (userId: string, content: string) => void;
  loadDirectMessages: (userId: string) => Promise<void>;
  sendTyping: (toUserId?: string) => void;
  stopTyping: () => void;
  markRead: (messageId: string) => void;
}
