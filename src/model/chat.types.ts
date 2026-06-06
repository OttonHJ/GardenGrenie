export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_nickname: string;
  content: string;
  type: "group" | "dm";
  recipient_id: string | null;
  timestamp: string;
  ttl?: number;
  expires_at?: string;
  allow_read_receipt?: boolean;
}

export interface ChatUser {
  id: string;
  nickname: string;
  joined_at: string;
  is_online: boolean;
  public_key?: string | null;
}

export type WsEvent =
  | { type: "group_message"; message: ChatMessage }
  | { type: "dm"; message: ChatMessage }
  | { type: "user_joined"; user: ChatUser }
  | { type: "user_left"; user_id: string }
  | { type: "users_list"; users: ChatUser[] }
  | { type: "group_history"; messages: ChatMessage[] }
  | { type: "group_key"; key: string }
  | { type: "typing"; user_id: string; nickname: string }
  | { type: "stop_typing"; user_id: string }
  | { type: "message_seen"; message_id: string; seen_by: string; seen_at: string }
  | { type: "message_expired"; message_id: string }
  | { type: "pong" }
  | { type: "error"; message: string };

export type WsClientEvent =
  | { type: "group_message"; content: string }
  | { type: "dm"; to: string; content: string }
  | { type: "typing"; to?: string }
  | { type: "stop_typing" }
  | { type: "mark_read"; message_id: string }
  | { type: "ping" };

export type ChatConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected";
