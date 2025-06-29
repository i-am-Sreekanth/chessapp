// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getCurrentUser } from '@aws-amplify/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);

  try {
    // Try up to 3 times (Amplify needs time to hydrate the user session)
    for (let i = 0; i < 3; i++) {
      try {
        const user = await getCurrentUser();
        if (user) return true;
      } catch (_) {
        await new Promise((res) => setTimeout(res, 500)); // wait 500ms
      }
    }

    throw new Error('User not authenticated');
  } catch (err) {
    console.error('User not authenticated:', err);
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
