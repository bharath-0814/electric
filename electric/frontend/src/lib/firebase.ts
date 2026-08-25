import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC2T0pDU7WJaB5RIiuJTOl_QOjrMafhdac",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "electric-36ba4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "electric-36ba4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "electric-36ba4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "988762865455",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:988762865455:web:ccaf72d53ac7be4ab2ebda",
};

let app: FirebaseApp | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  console.log('[Evora Firebase] Initialized successfully.');
} catch (err) {
  console.warn('[Evora Firebase] Initialization warning:', err);
}

export interface EvoraUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isDemo?: boolean;
}

const LOCAL_STORAGE_USER_KEY = 'evora_current_user';

export const authService = {
  isConfigured: () => true,

  getCurrentUser(): EvoraUser | null {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Check for redirect result on page load (if popup was blocked)
  async checkRedirectResult(): Promise<EvoraUser | null> {
    if (!auth) return null;
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        const user: EvoraUser = {
          uid: result.user.uid,
          email: result.user.email || 'user@evora.energy',
          displayName: result.user.displayName || 'Evora Driver',
          photoURL: result.user.photoURL || undefined,
          isDemo: false,
        };
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
        return user;
      }
    } catch (err) {
      console.warn('[Evora Firebase] Redirect check:', err);
    }
    return null;
  },

  async loginWithGoogle(): Promise<EvoraUser> {
    if (auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user: EvoraUser = {
          uid: result.user.uid,
          email: result.user.email || 'user@evora.energy',
          displayName: result.user.displayName || 'Evora Driver',
          photoURL: result.user.photoURL || undefined,
          isDemo: false,
        };
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
        return user;
      } catch (err: any) {
        console.warn('[Evora Firebase] Popup blocked or failed, attempting redirect mode...', err);
        // If popup was blocked by browser, automatically fall back to redirect
        if (
          err.code === 'auth/popup-blocked' ||
          err.code === 'auth/cancelled-popup-request' ||
          err.code === 'auth/popup-closed-by-user'
        ) {
          try {
            await signInWithRedirect(auth, googleProvider);
            // signInWithRedirect redirects the window, return temporary user
            return {
              uid: 'redirecting',
              email: '',
              displayName: 'Redirecting to Google...',
            };
          } catch (redirectErr: any) {
            throw redirectErr;
          }
        }
        throw err;
      }
    }

    const demoUser: EvoraUser = {
      uid: 'demo-google-user-101',
      email: 'alex.chen@evora.energy',
      displayName: 'Alex Chen',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isDemo: false,
    };
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
    return demoUser;
  },

  async loginWithEmail(email: string, pass: string): Promise<EvoraUser> {
    if (auth) {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const user: EvoraUser = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: cred.user.displayName || email.split('@')[0],
        photoURL: cred.user.photoURL || undefined,
        isDemo: false,
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      return user;
    }

    const user: EvoraUser = {
      uid: `user-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      isDemo: false,
    };
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    return user;
  },

  async registerWithEmail(email: string, pass: string, name: string): Promise<EvoraUser> {
    if (auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const user: EvoraUser = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: name || email.split('@')[0],
        photoURL: cred.user.photoURL || undefined,
        isDemo: false,
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      return user;
    }

    const user: EvoraUser = {
      uid: `user-${Date.now()}`,
      email,
      displayName: name || email.split('@')[0],
      isDemo: false,
    };
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    if (auth) {
      await signOut(auth).catch(() => {});
    }
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  },

  subscribe(callback: (user: EvoraUser | null) => void): () => void {
    if (auth) {
      return onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
          const user: EvoraUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Driver',
            photoURL: firebaseUser.photoURL || undefined,
            isDemo: false,
          };
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
          callback(user);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
          callback(null);
        }
      });
    }

    callback(authService.getCurrentUser());
    return () => {};
  },
};
