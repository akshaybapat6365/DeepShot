 import { useEffect, useState } from "react";
 import {
   collection,
   onSnapshot,
   orderBy,
   query,
 } from "firebase/firestore";
 
 import { db } from "@/lib/firebase";
 
 export type BloodWork = {
   id: string;
   date: Date;
   totalT: number | null;       // ng/dL
   freeT: number | null;        // pg/mL
   e2: number | null;           // pg/mL (estradiol)
   shbg: number | null;         // nmol/L
   hematocrit: number | null;   // %
   psa: number | null;          // ng/mL
   notes: string;
   createdAt: Date;
   updatedAt: Date;
 };
 
 export function useBloodWork(uid: string | undefined, refreshKey = 0) {
   const [bloodWork, setBloodWork] = useState<BloodWork[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (!uid) {
       return;
     }
 
     const q = query(
       collection(db, `users/${uid}/bloodwork`),
       orderBy("date", "desc")
     );
 
     const unsubscribe = onSnapshot(
       q,
       (snapshot) => {
         const results: BloodWork[] = [];
         snapshot.forEach((doc) => {
           const data = doc.data();
           results.push({
             id: doc.id,
             date: data.date?.toDate?.() ?? new Date(data.date),
             totalT: data.totalT ?? null,
             freeT: data.freeT ?? null,
             e2: data.e2 ?? null,
             shbg: data.shbg ?? null,
             hematocrit: data.hematocrit ?? null,
             psa: data.psa ?? null,
             notes: data.notes ?? "",
             createdAt: data.createdAt?.toDate?.() ?? new Date(),
             updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
           });
         });
         setBloodWork(results);
         setLoading(false);
       },
       (error) => {
         console.error("Error fetching blood work:", error);
         setLoading(false);
       }
     );
 
     return () => unsubscribe();
   }, [uid, refreshKey]);
 
  if (!uid) {
    return { bloodWork: [], loading: false };
  }

   return { bloodWork, loading };
 }
