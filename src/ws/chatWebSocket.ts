import { EventHandlerWs, StatusHandlerWs } from "@/src/model/ws.types";
import { WsClientEvent, WsEvent } from "@/src/model/chat.types";

const BASE_URL_WS = process.env.EXPO_PUBLIC_CHAT_WS_APP ?? "";

const PING_INTERVAL_MS = 25_000;

class ChatWebSocket {
  private ws: WebSocket | null = null;
  private token: string = "";
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  private eventHandlers: EventHandlerWs[] = [];
  private connectedStatusWs: StatusHandlerWs[] = [];
  private disconnectHandlers: StatusHandlerWs[] = [];

  /** Shared symmetric key received from server on connect (base64, 32 bytes) */
  groupKey: string | null = null;

  connect(token: string): void {
    this.token = token;
    this.groupKey = null;
    this._closeExistingSocket();
    this._openConnection();
  }

  disconnect(): void {
    this.groupKey = null;
    this._closeExistingSocket();
  }

  private _closeExistingSocket(): void {
    if (this.ws) {
      const old = this.ws;
      this.ws = null;
      old.onopen = null;
      old.onmessage = null;
      old.onerror = null;
      old.onclose = null;
      try { old.close(1000, "Replaced by new connection"); } catch {}
    }
    this._stopPing();
  }

  private _openConnection(): void {
    if (!BASE_URL_WS) {
      console.warn("[WS] EXPO_PUBLIC_CHAT_WS_APP no está definido");
      return;
    }
    const url = `${BASE_URL_WS}/ws/${this.token}`;
    console.log("[WS] Connecting to:", BASE_URL_WS + "/ws/<token>");
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("[WS] Connected");
      this._startPing();
      this.connectedStatusWs.forEach((x) => x());
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as WsEvent;
        console.log("[WS] Event:", data.type);
        if (data.type === "group_key") {
          this.groupKey = data.key;
        }
        this.eventHandlers.forEach((handler) => handler(data));
      } catch (e) {
        console.error("[WS] Parse error:", e);
      }
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.warn("[WS] Closed — code:", event.code, "reason:", event.reason || "(none)", "wasClean:", event.wasClean);
      this._stopPing();
      // No internal reconnect — ChatContext owns reconnection with a fresh token
      this.disconnectHandlers.forEach((x) => x());
    };

    this.ws.onerror = (event: Event) => {
      console.warn("[WS] Error:", event);
      this.ws?.close();
    };
  }

  private _startPing(): void {
    this.pingTimer = setInterval(() => {
      this._send({ type: "ping" });
    }, PING_INTERVAL_MS);
  }

  private _stopPing(): void {
    if (this.pingTimer != null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  sendGroupMessage(content: string): void {
    this._send({ type: "group_message", content });
  }

  sendDM(toUserId: string, content: string): void {
    this._send({ type: "dm", to: toUserId, content });
  }

  sendTyping(toUserId?: string): void {
    this._send(toUserId ? { type: "typing", to: toUserId } : { type: "typing" });
  }

  stopTyping(): void {
    this._send({ type: "stop_typing" });
  }

  markRead(messageId: string): void {
    this._send({ type: "mark_read", message_id: messageId });
  }

  private _send(event: WsClientEvent): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  onEvent(handler: EventHandlerWs) {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter((item) => item !== handler);
    };
  }

  onConnect(handler: StatusHandlerWs) {
    this.connectedStatusWs.push(handler);
    return () => {
      this.connectedStatusWs = this.connectedStatusWs.filter((item) => item !== handler);
    };
  }

  onDisconnect(handler: StatusHandlerWs) {
    this.disconnectHandlers.push(handler);
    return () => {
      this.disconnectHandlers = this.disconnectHandlers.filter((item) => item !== handler);
    };
  }
}

export const chatWebSocket = new ChatWebSocket();
