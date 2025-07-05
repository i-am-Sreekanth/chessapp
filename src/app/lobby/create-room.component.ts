import { Component } from '@angular/core';
import { nanoid } from 'nanoid';
import { WebsocketService } from '../services/websocket.service';
import { RoomService } from '../services/room.service';

@Component({
  selector: 'app-create-room',
  standalone: true,
  template: `
    <button (click)="createRoom()">Create Room</button>
    <p *ngIf="roomId">Room ID: {{ roomId }}</p>
  `
})
export class CreateRoomComponent {
  roomId = '';

  constructor(
    private wsService: WebsocketService,
    private roomService: RoomService
  ) {}

  createRoom() {
    this.roomId = nanoid(6).toUpperCase();
    this.roomService.setRoomId(this.roomId);
    this.wsService.connect();
    this.wsService.sendMessage('createRoom', {
    roomId: this.roomId,
  });
  }
}
