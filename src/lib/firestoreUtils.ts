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

// Function to save a participant's score
export async function saveParticipantScore(
  uid: string,
  displayName: string,
  email: string,
  score: number,
  timeUsed: number,
  answeredCount: number
): Promise<void> {
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
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Function to fetch all participant records in descending order
export async function fetchParticipantsList(): Promise<ParticipantScore[]> {
  const path = "participants";
  try {
    const participantsCollection = collection(db, "participants");
    const q = query(participantsCollection, orderBy("score", "desc"));
    const snapshot = await getDocs(q);
    
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
        updatedAt: data.updatedAt
      });
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Function to delete a participant score record
export async function deleteParticipantScore(uid: string): Promise<void> {
  const path = `participants/${uid}`;
  try {
    const docRef = doc(db, "participants", uid);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
