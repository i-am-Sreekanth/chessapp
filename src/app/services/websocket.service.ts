import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<any>();

  private readonly WS_URL = 'wss://mse1rzqm0g.execute-api.ap-southeast-2.amazonaws.com/production/';

  connect(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.socket = new WebSocket(this.WS_URL);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected');
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.action === 'initGameState') {
          console.log('[WebSocket] Received initGameState');
          this.messageSubject.next({
            type: 'init',
            fen: data.fen,
            pgn: data.pgn
          });
        } else if (data.action === 'move') {
          this.messageSubject.next({
            type: 'move',
            move: data.move,
            fen: data.fen,
            pgn: data.pgn
          });
        } else {
          console.log('[WebSocket] Unknown action:', data);
        }
      };

      this.socket.onerror = (err) => {
        console.error('[WebSocket] Error:', err);
      };

      this.socket.onclose = () => {
        console.warn('[WebSocket] Disconnected');
      };
    }
  }

  sendMove(roomId: string, move: { from: string; to: string }, fen: string, pgn: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({
        action: 'sendMove',
        roomId,
        move,
        fen,
        pgn
      });
      this.socket.send(msg);
    } else {
      console.warn('[WebSocket] Cannot send move, socket not open');
    }
  }

  sendMessage(action: string, payload: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({ action, ...payload });
      this.socket.send(msg);
    } else {
      console.warn('[WebSocket] Cannot send, socket not open');
    }
  }

  disconnect(): void {
    this.socket?.close();
  }

  onMessage() {
    return this.messageSubject.asObservable();
  }
}
