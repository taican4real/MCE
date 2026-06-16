import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db, auth } from "./firebase";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export interface ParticipantScore {
  uid: string;
  displayName: string;
  email: string;
  score: number;
  timeUsed: number;
  answeredCount: number;
  tabSwitchCount: number;
  antiCheatViolated: boolean;
  updatedAt: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const LOCAL_STORAGE_KEY = "mce_participants_backup";

export function getLocalParticipantsFallback(): ParticipantScore[] {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    console.error("Failed to read local fallback participants:", e);
  }
  return [];
}

export function saveLocalParticipantFallback(p: ParticipantScore) {
  try {
    if (typeof window !== "undefined") {
      const existing = getLocalParticipantsFallback();
      const filtered = existing.filter(item => item.uid !== p.uid);
      filtered.push(p);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error("Failed to write local fallback participant:", e);
  }
}

// Function to save a participant's score
export async function saveParticipantScore(
  uid: string,
  displayName: string,
  email: string,
  score: number,
  timeUsed: number,
  answeredCount: number,
  tabSwitchCount: number,
  antiCheatViolated: boolean
): Promise<void> {
  const localObj: ParticipantScore = {
    uid,
    displayName: displayName || email.split("@")[0],
    email,
    score,
    timeUsed,
    answeredCount,
    tabSwitchCount,
    antiCheatViolated,
    updatedAt: new Date().toISOString()
  };
  saveLocalParticipantFallback(localObj);

  if (uid.startsWith("sandbox_")) {
    console.log("Sandbox user: Persisted score in local storage backup.");
    return;
  }

  const path = `participants/${uid}`;
  try {
    const docRef = doc(db, "participants", uid);
    await setDoc(docRef, {
      uid,
      displayName: displayName || email.split("@")[0],
      email,
      score,
      timeUsed,
      answeredCount,
      tabSwitchCount,
      antiCheatViolated,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.warn("Failing over to local backup persistence for user:", uid, error);
    // If the error seems to be domain-auth or permission, we gracefully recover without crashing clients
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Function to fetch all participant records in descending order
export async function fetchParticipantsList(): Promise<ParticipantScore[]> {
  const path = "participants";
  const localBackup = getLocalParticipantsFallback();

  try {
    const participantsCollection = collection(db, "participants");
    const q = query(participantsCollection, orderBy("score", "desc"));
    const snapshot = await getDocs(q);
    
    // We get real lists from firestore
    const results: ParticipantScore[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({
        uid: data.uid,
        displayName: data.displayName,
        email: data.email,
        score: Number(data.score),
        timeUsed: Number(data.timeUsed),
        answeredCount: Number(data.answeredCount),
        tabSwitchCount: Number(data.tabSwitchCount || 0),
        antiCheatViolated: Boolean(data.antiCheatViolated || false),
        updatedAt: data.updatedAt
      });
    });

    // Merge both lists cleanly, ensuring duplicates favor the newer record
    const mergedMap = new Map<string, ParticipantScore>();
    results.forEach(p => mergedMap.set(p.uid, p));
    localBackup.forEach(p => {
      if (!mergedMap.has(p.uid)) {
        mergedMap.set(p.uid, p);
      }
    });

    return Array.from(mergedMap.values()).sort((a, b) => b.score - a.score);
  } catch (error) {
    console.warn("Firestore list fetch failed, falling back to local storage participants:", error);
    return localBackup.sort((a, b) => b.score - a.score);
  }
}

// Function to delete a participant score record
export async function deleteParticipantScore(uid: string): Promise<void> {
  // Always clean up local storage
  try {
    if (typeof window !== "undefined") {
      const list = getLocalParticipantsFallback();
      const filtered = list.filter(item => item.uid !== uid);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error(e);
  }

  if (uid.startsWith("sandbox_")) {
    return;
  }

  const path = `participants/${uid}`;
  try {
    const docRef = doc(db, "participants", uid);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
