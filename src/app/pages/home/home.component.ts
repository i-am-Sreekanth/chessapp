import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <h1>Welcome to ChessZone</h1>
      <p>Play epic chess, climb the leaderboard, and have fun.</p>
    </div>
  `
})
export class HomeComponent {}
