import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <h1>Leaderboard </h1>
      <p>Top players: :</p>
      <ol>
        <li>one - 9999 pts</li>
        <li>two - 8750 pts</li>
        <li>three - 8200 pts</li>
      </ol>
    </div>
  `
})
export class LeaderboardComponent {}
