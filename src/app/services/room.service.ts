import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private roomId = '';

  setRoomId(id: string) {
    this.roomId = id;
  }

  getRoomId(): string {
    return this.roomId;
  }
}
