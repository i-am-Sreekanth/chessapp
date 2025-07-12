import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private sock1 = new WebSocket('wss://your-signaling-server');
  private incoming = new Subject<{ type: string, payload: any }>();
  private socket2: WebSocket | null = null;
  private messageSubject = new Subject<any>();
  private readonly WS_URL2 = 'wss://mse1rzqm0g.execute-api.ap-southeast-2.amazonaws.com/production/';

  constructor() {
    this.sock1.onmessage = evt => {
      this.incoming.next(JSON.parse(evt.data));
    };
  }

  /*moves*/
  onReceive(): Observable<any> {
    return this.incoming.asObservable();
  }

  send(msg: any) {
    this.sock1.send(JSON.stringify(msg));
  }

  /*chat*/
  connect(): void {
    if (!this.socket2 || this.socket2.readyState !== WebSocket.OPEN) {
      this.socket2 = new WebSocket(this.WS_URL2);

      this.socket2.onopen = () => {
        console.log('[WebSocket2] Connected');
      };

      this.socket2.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.action === 'initGameState') {
          console.log('[WebSocket2] Received initGameState');
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
          console.log('[WebSocket2] Unknown action:', data);
        }
      };

      this.socket2.onerror = (err) => {
        console.error('[WebSocket2] Error:', err);
      };

      this.socket2.onclose = () => {
        console.warn('[WebSocket2] Disconnected');
      };
    }
  }

  sendMove(roomId: string, move: { from: string; to: string }, fen: string, pgn: string): void {
    if (this.socket2?.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({
        action: 'sendMove',
        roomId,
        move,
        fen,
        pgn
      });
      this.socket2.send(msg);
    } else {
      console.warn('[WebSocket2] Cannot send move, socket not open');
    }
  }

  sendMessage(action: string, payload: any): void {
    if (this.socket2?.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({ action, ...payload });
      this.socket2.send(msg);
    } else {
      console.warn('[WebSocket2] Cannot send, socket not open');
    }
  }

  disconnect(): void {
    this.socket2?.close();
  }

  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }
}
