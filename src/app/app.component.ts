import { Component, OnInit, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Amplify } from 'aws-amplify';
import {
  getCurrentUser,
  signOut,
  signInWithRedirect,
} from '@aws-amplify/auth';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-2_pjzcHs0oh',
      userPoolClientId: '1rrg39qr9eg391adp0to5uo0m2',
      loginWith: {
        oauth: {
          domain: 'ap-southeast-2pjzchs0oh.auth.ap-southeast-2.amazoncognito.com',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: ['http://localhost:4200/login'],
          redirectSignOut: ['http://localhost:4200/home'],
          responseType: 'code'
        }
      }
    }
  }
});



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- 🌟 NAVBAR -->
    <nav class="game-navbar">
      <div class="container nav-container">
        <div class="brand">
          <span>Adiyen Technologies</span>
        </div>

        <ul class="nav-links">
          <li><a routerLink="/home" routerLinkActive="active">Home</a></li>
          <li><a routerLink="/games" routerLinkActive="active">Games</a></li>
          <li><a routerLink="/leaderboard" routerLinkActive="active">Leaderboard</a></li>
          <li><a routerLink="/profile" routerLinkActive="active">Profile</a></li>
        </ul>
      </div>
    </nav>

    <!-- 🌟 MAIN -->
    <main class="main-wrapper">
      <router-outlet></router-outlet>
    </main>
  `
})

export class AppComponent implements OnInit {
  user = signal<any | null>(null);

  formFields = {
    signUp: {
      name: { order: 1 },
      email: { order: 2 },
      password: { order: 3 },
      confirm_password: { order: 4 },
    }
  };

  constructor(private router: Router) {}

  async ngOnInit() {
  try {
    const currentUser = await getCurrentUser();
    this.user.set(currentUser);

    const returnUrl = localStorage.getItem('returnUrl') || '/games';
    localStorage.removeItem('returnUrl');

    if (this.router.url === '/login') {
      this.router.navigateByUrl(returnUrl);
    }
  } catch {
    this.user.set(null);
  }
  }


  isLoggedIn(): boolean {
    return !!this.user();
  }

  async login() {
    await signInWithRedirect();
  }

  async logout() {
    await signOut();
    this.user.set(null);
    this.router.navigate(['/home']);
  }

  userAvatarUrl(): string {
    return 'assets/avatar.png';
  }
}
