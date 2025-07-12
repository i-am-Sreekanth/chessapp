import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Amplify } from 'aws-amplify';
import { WebSocketService } from './app/services/websocket.service';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

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

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes),WebSocketService, provideHttpClient()]
}).catch(err => console.error(err));
