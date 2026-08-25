import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let googleProvider: GoogleAuthProvider | null = null;

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log('[Evora Firebase] Firebase Auth initialized successfully.');
  } catch (err) {
    console.warn('[Evora Firebase] Initialization failed, using simulated auth:', err);
  }
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
  isConfigured: () => isConfigured,

  getCurrentUser(): EvoraUser | null {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  async loginWithGoogle(): Promise<EvoraUser> {
    if (auth && googleProvider) {
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
    }

    // Demo Google user
    const demoUser: EvoraUser = {
      uid: 'demo-google-user-101',
      email: 'alex.chen@evora.energy',
      displayName: 'Alex Chen',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isDemo: true,
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

    const demoUser: EvoraUser = {
      uid: `demo-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      isDemo: true,
    };
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
    return demoUser;
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

    const demoUser: EvoraUser = {
      uid: `demo-${Date.now()}`,
      email,
      displayName: name || email.split('@')[0],
      isDemo: true,
    };
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
    return demoUser;
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
          // If no firebase user, check local storage (e.g. for guest demo)
          const local = authService.getCurrentUser();
          if (local && local.isDemo) {
            callback(local);
          } else {
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
            callback(null);
          }
        }
      });
    }

    // Default local storage check
    callback(authService.getCurrentUser());
    return () => {};
  },
};
