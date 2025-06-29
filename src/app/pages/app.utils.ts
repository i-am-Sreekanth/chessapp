import { getCurrentUser } from '@aws-amplify/auth';

export async function isUserLoggedIn(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch {
    return false;
  }
}
