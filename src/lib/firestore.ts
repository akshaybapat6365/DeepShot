import type { User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export async function ensureUserDocument(user: User) {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const timezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";

    await setDoc(ref, {
      createdAt: serverTimestamp(),
      settings: {
        timezone,
        defaultProtocol: null,
      },
    });
  }
}

export async function logInjection(params: {
  uid: string;
  protocolId: string;
  date: Date;
  doseMl: number;
  concentrationMgPerMl: number;
  notes?: string;
}) {
  const doseMg = params.doseMl * params.concentrationMgPerMl;

  await addDoc(collection(db, `users/${params.uid}/injections`), {
    protocolId: params.protocolId,
    date: Timestamp.fromDate(params.date),
    doseMl: params.doseMl,
    concentrationMgPerMl: params.concentrationMgPerMl,
    doseMg,
    notes: params.notes ?? "",
    isTrashed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateInjection(params: {
  uid: string;
  injectionId: string;
  date: Date;
  doseMl: number;
  concentrationMgPerMl: number;
  notes?: string;
}) {
  const doseMg = params.doseMl * params.concentrationMgPerMl;

  await updateDoc(
    doc(db, `users/${params.uid}/injections`, params.injectionId),
    {
      date: Timestamp.fromDate(params.date),
      doseMl: params.doseMl,
      concentrationMgPerMl: params.concentrationMgPerMl,
      doseMg,
      notes: params.notes ?? "",
      updatedAt: serverTimestamp(),
    }
  );
}

export async function trashInjection(params: {
  uid: string;
  injectionId: string;
}) {
  await updateDoc(doc(db, `users/${params.uid}/injections`, params.injectionId), {
    isTrashed: true,
    trashedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function restoreInjection(params: {
  uid: string;
  injectionId: string;
}) {
  await updateDoc(doc(db, `users/${params.uid}/injections`, params.injectionId), {
    isTrashed: false,
    trashedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function createOrRestartProtocol(
  uid: string,
  data: {
    name: string;
    startDate: Date;
    endDate?: Date | null;
    intervalDays: number;
    doseMl: number;
    concentrationMgPerMl: number;
    themeKey?: string;
    notes?: string;
  }
) {
  const batch = writeBatch(db);

  const activeQ = query(
    collection(db, `users/${uid}/protocols`),
    where("isActive", "==", true)
  );
  const activeSnap = await getDocs(activeQ);

  activeSnap.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  });

  const newRef = doc(collection(db, `users/${uid}/protocols`));
  batch.set(newRef, {
    name: data.name,
    startDate: Timestamp.fromDate(data.startDate),
    endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
    intervalDays: data.intervalDays,
    doseMl: data.doseMl,
    concentrationMgPerMl: data.concentrationMgPerMl,
    isActive: true,
    themeKey: data.themeKey ?? "ember",
    isTrashed: false,
    notes: data.notes ?? "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const timezone = userSnap.exists()
    ? (userSnap.data()?.settings?.timezone as string | undefined) ?? "UTC"
    : Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";

  const userPayload: Record<string, unknown> = {
    settings: {
      timezone,
      defaultProtocol: newRef.id,
    },
    updatedAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    userPayload.createdAt = serverTimestamp();
  }

  batch.set(userRef, userPayload, { merge: true });

  await batch.commit();
  return newRef.id;
}

export async function setActiveProtocol(params: {
  uid: string;
  protocolId: string;
}) {
  const batch = writeBatch(db);

  const activeQ = query(
    collection(db, `users/${params.uid}/protocols`),
    where("isActive", "==", true)
  );
  const activeSnap = await getDocs(activeQ);

  activeSnap.forEach((docSnap) => {
    if (docSnap.id === params.protocolId) return;
    batch.update(docSnap.ref, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  });

  batch.update(doc(db, `users/${params.uid}/protocols`, params.protocolId), {
    isActive: true,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function updateProtocol(
  uid: string,
  protocolId: string,
  data: {
    name: string;
    startDate: Date;
    endDate?: Date | null;
    intervalDays: number;
    doseMl: number;
    concentrationMgPerMl: number;
    themeKey?: string;
    notes?: string;
  }
) {
  await updateDoc(doc(db, `users/${uid}/protocols`, protocolId), {
    name: data.name,
    startDate: Timestamp.fromDate(data.startDate),
    endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
    intervalDays: data.intervalDays,
    doseMl: data.doseMl,
    concentrationMgPerMl: data.concentrationMgPerMl,
    themeKey: data.themeKey ?? "ember",
    notes: data.notes ?? "",
    updatedAt: serverTimestamp(),
  });
}

export async function trashProtocol(params: {
  uid: string;
  protocolId: string;
}) {
  await updateDoc(doc(db, `users/${params.uid}/protocols`, params.protocolId), {
    isTrashed: true,
    isActive: false,
    trashedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function restoreProtocol(params: {
  uid: string;
  protocolId: string;
}) {
  await updateDoc(doc(db, `users/${params.uid}/protocols`, params.protocolId), {
    isTrashed: false,
    trashedAt: null,
    updatedAt: serverTimestamp(),
  });
}
