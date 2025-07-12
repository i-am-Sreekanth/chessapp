import { Component } from '@angular/core';
import { DxTextBoxModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { DxChatTypes } from 'devextreme-angular/ui/chat';
import { WebSocketService } from '../../services/websocket.service';
import { DxChatModule } from 'devextreme-angular';
@Component({
  selector: 'app-chat',
  imports: [DxTextBoxModule,CommonModule,DxChatModule],
  providers: [WebSocketService],
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  currentUser: DxChatTypes.User = { id: '1', name: 'Player 1' };
  messages: DxChatTypes.Message[] = [];
  typingUsers: DxChatTypes.User[] = [];

  constructor(private ws: WebSocketService) {
    this.ws.onReceive().subscribe(msg => {
      if (msg.type === 'chat') {
        this.messages = [...this.messages, msg.payload];
      }
      if (msg.type === 'typing') {
        this.typingUsers = msg.payload ? [msg.payload] : [];
      }
    });
  }

  onMessageEntered(e: DxChatTypes.MessageEnteredEvent) {
    const newMsg: DxChatTypes.Message = e.message;
    this.messages = [...this.messages, newMsg];
    this.ws.send({ type: 'chat', payload: newMsg });
  }

  onTypingStart() {
    this.ws.send({ type: 'typing', payload: this.currentUser });
  }

  onTypingEnd() {
    this.ws.send({ type: 'typing', payload: null });
  }
  sendMessage(e: any) {
    const text = e.value;
    if (text) {
      this.messages.push({ text, user: this.currentUser, date: new Date() });
      e.component.reset();
    }
}
}
