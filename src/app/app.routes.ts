import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { GameComponent } from './pages/games/games.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LoginComponent } from './pages/login/login.component';
import { ChatComponent } from './pages/chat/chat.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'games', component: GameComponent  },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: ChatComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];

