import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
  limit,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type Injection = {
  id: string;
  protocolId: string;
  date: Date;
  doseMl: number;
  concentrationMgPerMl: number;
  doseMg: number;
  notes?: string;
  isTrashed?: boolean;
  trashedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

type InjectionDoc = Omit<
  Injection,
  "id" | "date" | "createdAt" | "updatedAt" | "trashedAt"
> & {
  date: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  trashedAt?: Timestamp;
};

const toDate = (value?: Timestamp | null) =>
  value ? value.toDate() : null;

export function useInjections(uid?: string, refreshKey = 0) {
  const [state, setState] = useState<{
    injections: Injection[];
    loadedUid: string | null;
  }>({ injections: [], loadedUid: null });

  const injections =
    uid && state.loadedUid === uid ? state.injections : [];
  const loading = uid ? state.loadedUid !== uid : false;

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, `users/${uid}/injections`),
      orderBy("date", "desc"),
      limit(200)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((doc) => {
          const data = doc.data() as InjectionDoc;
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
            trashedAt: toDate(data.trashedAt),
          } as Injection;
        });
        setState({ injections: next, loadedUid: uid });
      },
      () => {
        setState({ injections: [], loadedUid: uid });
      }
    );

    return () => unsubscribe();
  }, [uid, refreshKey]);

  return { injections, loading };
}
