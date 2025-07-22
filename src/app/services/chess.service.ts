import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChessRoomService {
  channel: BroadcastChannel | null = null;
  roomId: string | null = null;
  playerColor: 'white' | 'black' | null = null;
  onMove: ((msg: any) => void) | null = null;
  onReset: (() => void) | null = null;

  joinRoom(roomId: string) {
    this.roomId = roomId;
    this.channel = new BroadcastChannel(roomId);

    let color = localStorage.getItem(`${roomId}-player`);
    if (!color) {
      color = Math.random() < 0.5 ? 'white' : 'black';
      localStorage.setItem(`${roomId}-player`, color);
    }
    this.playerColor = color as 'white' | 'black';

    this.channel.onmessage = (event) => {
      const msg = event.data;
      if (msg.sender === this.playerColor) return;
      if (msg.type === 'move' && this.onMove) this.onMove(msg);
      if (msg.type === 'reset' && this.onReset) this.onReset();
    };
  }

  sendMove(move: { from: string; to: string; fen: string }) {
    if (!this.channel || !this.playerColor) return;
    this.channel.postMessage({ ...move, type: 'move', sender: this.playerColor });
  }

  sendReset() {
    if (!this.channel || !this.playerColor) return;
    this.channel.postMessage({ type: 'reset', sender: this.playerColor });
  }
}
