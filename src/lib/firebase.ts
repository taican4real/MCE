import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export { auth, db };

const provider = new GoogleAuthProvider();
// Add required Google Workspace scopes
provider.addScope("https://www.googleapis.com/auth/presentations");
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/userinfo.email");
provider.addScope("https://www.googleapis.com/auth/userinfo.profile");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Check localStorage for a sandbox user session first
  try {
    if (typeof window !== "undefined") {
      const savedSandboxUser = localStorage.getItem("sandbox_user");
      const savedSandboxToken = localStorage.getItem("sandbox_token");
      if (savedSandboxUser && savedSandboxToken) {
        const parsedUser = JSON.parse(savedSandboxUser);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(parsedUser, savedSandboxToken);
        }, 50);
        // Return a dummy unsubscribe
        return () => {};
      }
    }
  } catch (e) {
    console.error("Failed to restore sandbox auth session:", e);
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Try to retrieve token from localStorage backup
        let backupToken: string | null = null;
        try {
          if (typeof window !== "undefined") {
            backupToken = localStorage.getItem("google_access_token");
          }
        } catch (e) {
          console.error(e);
        }

        if (backupToken) {
          cachedAccessToken = backupToken;
          if (onAuthSuccess) onAuthSuccess(user, backupToken);
        } else {
          if (onAuthFailure) onAuthFailure();
        }
      }
    } else {
      // If no valid Firebase auth user, check if we had a sandbox user backup
      let hasSandboxBackup = false;
      try {
        if (typeof window !== "undefined") {
          hasSandboxBackup = !!localStorage.getItem("sandbox_user");
        }
      } catch (e) {}

      if (!hasSandboxBackup) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get access token from Firebase Auth");
    }

    cachedAccessToken = credential.accessToken;
    try {
      if (typeof window !== "undefined" && cachedAccessToken) {
        localStorage.setItem("google_access_token", cachedAccessToken);
      }
    } catch (e) {
      console.error("Local storage error saving access token:", e);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!cachedAccessToken && typeof window !== "undefined") {
    try {
      return localStorage.getItem("google_access_token");
    } catch (e) {}
  }
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("google_access_token");
      localStorage.removeItem("sandbox_user");
      localStorage.removeItem("sandbox_token");
    }
  } catch (e) {
    console.error("Local storage error clearing auth assets:", e);
  }
};
