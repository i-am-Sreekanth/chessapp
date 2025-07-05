import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { WebsocketService } from '../services/websocket.service';
import { RoomService } from '../services/room.service';

@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [FormsModule], 
  template: `
    <input [(ngModel)]="roomId" placeholder="Enter Room ID" />
    <button (click)="joinRoom()">Join Room</button>
  `
})
export class JoinRoomComponent {
  roomId = '';

  constructor(
    private wsService: WebsocketService,
    private roomService: RoomService
  ) {}

  joinRoom() {
    this.roomService.setRoomId(this.roomId);
    this.wsService.connect();
    this.wsService.sendMessage({
      action: 'joinRoom',
      roomId: this.roomId,
    });
  }
}
