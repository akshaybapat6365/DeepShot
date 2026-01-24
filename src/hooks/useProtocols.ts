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

export type Protocol = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  intervalDays: number;
  concentrationMgPerMl: number;
  doseMl: number;
  isActive: boolean;
  themeKey?: string;
  notes?: string;
  isTrashed?: boolean;
  trashedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

type ProtocolDoc = Omit<
  Protocol,
  "id" | "startDate" | "endDate" | "createdAt" | "updatedAt" | "trashedAt"
> & {
  startDate: Timestamp;
  endDate?: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  trashedAt?: Timestamp;
};

const toDate = (value?: Timestamp | null) =>
  value ? value.toDate() : null;

export function useProtocols(uid?: string, refreshKey = 0) {
  const [state, setState] = useState<{
    protocols: Protocol[];
    loadedUid: string | null;
  }>({ protocols: [], loadedUid: null });

  const protocols =
    uid && state.loadedUid === uid ? state.protocols : [];
  const loading = uid ? state.loadedUid !== uid : false;

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, `users/${uid}/protocols`),
      orderBy("startDate", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((doc) => {
          const data = doc.data() as ProtocolDoc;
          return {
            id: doc.id,
            ...data,
            startDate: data.startDate.toDate(),
            endDate: toDate(data.endDate),
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
            trashedAt: toDate(data.trashedAt),
          } as Protocol;
        });
        setState({ protocols: next, loadedUid: uid });
      },
      () => {
        setState({ protocols: [], loadedUid: uid });
      }
    );

    return () => unsubscribe();
  }, [uid, refreshKey]);

  return { protocols, loading };
}
