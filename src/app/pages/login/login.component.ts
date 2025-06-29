import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { signInWithRedirect, getCurrentUser } from '@aws-amplify/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="container py-5 text-center">
      <h2 *ngIf="checking">🔄 Checking login status...</h2>
      <h2 *ngIf="loggingIn">🔐 Redirecting to Cognito login...</h2>
    </div>
  `
})
export class LoginComponent implements OnInit {
  returnUrl = '/home';  // default fallback
  checking = true;
  loggingIn = false;

  private cognitoDomain = 'ap-southeast-2pjzchs0oh.auth.ap-southeast-2.amazoncognito.com';
  private clientId = '1rrg39qr9eg391adp0to5uo0m2';
  private responseType = 'code';
  private scope = 'openid+profile+email';

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    // 1. Get returnUrl from query or local storage fallback
    const queryReturn = this.route.snapshot.queryParamMap.get('returnUrl');
    const storedReturn = localStorage.getItem('returnUrl');
    this.returnUrl = queryReturn || storedReturn || '/games';

    // 2. Check if redirected back from Cognito with ?code=
    const hasCode = window.location.href.includes('?code=');

    if (hasCode) {
      try {
        const user = await getCurrentUser(); // auto-triggers Amplify internal token exchange
        if (user) {
          localStorage.removeItem('returnUrl');
          this.router.navigateByUrl(this.returnUrl);
          return;
        }
      } catch (err) {
        console.error('❌ Error processing Cognito login redirect', err);
      }
    }

    // 3. No ?code, initiate sign-in with redirect
    this.checking = false;
    this.loggingIn = true;

    localStorage.setItem('returnUrl', this.returnUrl);

    // Optional manual fallback (if Amplify misbehaves)
    const redirectUri = encodeURIComponent(`http://localhost:4200/login`);
    const fallbackLoginUrl =
      `https://${this.cognitoDomain}/login?` +
      `client_id=${this.clientId}` +
      `&response_type=${this.responseType}` +
      `&scope=${this.scope}` +
      `&redirect_uri=${redirectUri}`;

    try {
      await signInWithRedirect();
    } catch (e) {
      console.warn('Amplify signInWithRedirect failed, using manual redirect');
      window.location.href = fallbackLoginUrl;
    }
  }
}
