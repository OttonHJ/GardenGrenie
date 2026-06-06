import { EventHandlerWs, StatusHandlerWs } from "@/src/model/ws.types";
import { WsClientEvent, WsEvent } from "@/src/model/chat.types";

const BASE_URL_WS = process.env.EXPO_PUBLIC_CHAT_WS_APP ?? "";

const PING_INTERVAL_MS = 25_000;
const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

class ChatWebSocket {
  private ws: WebSocket | null = null;
  private token: string = "";
  private shouldReconnect: boolean = false;

  private reconnectDelay: number = INITIAL_RECONNECT_DELAY_MS;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTime: ReturnType<typeof setInterval> | null = null;

  private eventHandlers: EventHandlerWs[] = [];
  private connectedStatusWs: StatusHandlerWs[] = [];
  private disconnectHandlers: StatusHandlerWs[] = [];

  /** Shared symmetric key received from server on connect (base64, 32 bytes) */
  groupKey: string | null = null;

  connect(token: string): void {
    this.token = token;
    this.shouldReconnect = true;
    this.reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
    this.groupKey = null;
    this._closeExistingSocket();
    this._openConnection();
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
    this._clearTimers();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.groupKey = null;
    this._closeExistingSocket();
  }

  private _openConnection(): void {
    if (!BASE_URL_WS) {
      console.warn("EXPO_PUBLIC_CHAT_WS_APP no está definido");
      return;
    }
    const url = `${BASE_URL_WS}/ws/${this.token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
      this._startPing();
      this.connectedStatusWs.forEach((x) => x());
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as WsEvent;
        if (data.type === "group_key") {
          this.groupKey = data.key;
        }
        this.eventHandlers.forEach((handler) => handler(data));
      } catch (e) {
        console.error("Error al parsear mensaje WS:", e);
      }
    };

    this.ws.onclose = () => {
      this._stopPing();
      this.disconnectHandlers.forEach((x) => x());
      if (this.shouldReconnect) {
        this._scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private _startPing(): void {
    this.pingTime = setInterval(() => {
      this._send({ type: "ping" });
    }, PING_INTERVAL_MS);
  }

  private _stopPing(): void {
    if (this.pingTime != null) {
      clearInterval(this.pingTime);
      this.pingTime = null;
    }
  }

  private _scheduleReconnect(): void {
    this.reconnectTimer = setTimeout(() => {
      this._openConnection();
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        MAX_RECONNECT_DELAY_MS,
      );
    }, this.reconnectDelay);
  }

  private _clearTimers(): void {
    if (this.reconnectTimer != null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this._stopPing();
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
