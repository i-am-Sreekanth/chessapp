import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgxChessBoardModule } from 'ngx-chess-board';
import { AppComponent } from './app.component';
import { ActionsComponent } from './components/actions/actions.component';
import { FenComponent } from './components/fen/fen.component';
import { MovesComponent } from './components/moves/moves.component';
import { SettingsComponent } from './components/settings/settings.component';

@NgModule({
  declarations: [
    ActionsComponent,
    MovesComponent,
    SettingsComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgxChessBoardModule
  ],
  providers: [],
  bootstrap: [],
})
export class AppModule {}
