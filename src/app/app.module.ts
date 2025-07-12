import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgxChessBoardModule } from 'ngx-chess-board';
import { AppComponent } from './app.component';
import { ActionsComponent } from './components/actions/actions.component';
import { FenComponent } from './components/fen/fen.component';
import { MovesComponent } from './components/moves/moves.component';
import { SettingsComponent } from './components/settings/settings.component';
import { DxTextBoxModule } from 'devextreme-angular';
import { DxChatModule } from 'devextreme-angular';
import { ChatComponent } from './pages/chat/chat.component';

@NgModule({
  declarations: [
    ActionsComponent,
    MovesComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    DxTextBoxModule,
    DxChatModule,
    NgxChessBoardModule
  ],
  providers: [],
  bootstrap: [],
  schemas:[NO_ERRORS_SCHEMA]
})
export class AppModule {}
