import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send'
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory (never in localStorage or sessionStorage).
let cachedAccessToken: string | null = null;
let cachedUserEmail: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedUserEmail = user.email || null;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      cachedUserEmail = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (
  loginHint?: string
): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    if (loginHint && loginHint.includes('@')) {
      provider.setCustomParameters({
        login_hint: loginHint.trim(),
        prompt: 'consent'
      });
    } else {
      provider.setCustomParameters({
        prompt: 'consent'
      });
    }

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Gmail access token from Google sign-in.');
    }

    cachedAccessToken = credential.accessToken;
    cachedUserEmail = result.user.email || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getAuthenticatedGmailUser = (): string | null => {
  return cachedUserEmail;
};

export const logoutGmailAuth = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  cachedUserEmail = null;
};
