import { Injectable, DestroyRef, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  private messageSubject = new Subject<any>();
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Auto-clean when service is destroyed (Angular v17 feature)
    this.destroyRef.onDestroy(() => this.close());
  }

  /**
   * Connects to a WebSocket server
   * @param url The WebSocket endpoint (e.g., ws://localhost:3000)
   */
  connect(url: string): Observable<any> {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('[WebSocket] Connected to:', url);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageSubject.next(data);
      } catch {
        this.messageSubject.next(event.data); // fallback for plain strings
      }
    };

    this.socket.onerror = (err) => {
      console.error('[WebSocket] Error:', err);
    };

    this.socket.onclose = () => {
      console.log('[WebSocket] Connection closed.');
    };

    return this.messageSubject.asObservable();
  }

  /**
   * Sends a message through the WebSocket
   * @param data Any serializable object
   */
  send(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send message — socket not open');
    }
  }

  /**
   * Closes the WebSocket connection
   */
  close(): void {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      this.socket.close();
    }
  }
}
