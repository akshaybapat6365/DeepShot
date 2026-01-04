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
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

type InjectionDoc = Omit<Injection, "id" | "date" | "createdAt" | "updatedAt"> & {
  date: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

const toDate = (value?: Timestamp | null) =>
  value ? value.toDate() : null;

export function useInjections(uid?: string) {
  const [injections, setInjections] = useState<Injection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uid) {
      setInjections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
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
          } as Injection;
        });
        setInjections(next);
        setLoading(false);
      },
      () => {
        setInjections([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { injections, loading };
}
