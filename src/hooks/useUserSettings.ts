 import { useEffect, useState } from "react";
 import { doc, onSnapshot } from "firebase/firestore";
 
 import { db } from "@/lib/firebase";
 
 export type UserSettings = {
   timezone: string;
   defaultProtocol: string | null;
 };
 
const defaultSettings: UserSettings = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  defaultProtocol: null,
};

 export function useUserSettings(uid: string | undefined) {
   const [settings, setSettings] = useState<UserSettings | null>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (!uid) {
       return;
     }
 
     const unsubscribe = onSnapshot(
       doc(db, "users", uid),
       (snapshot) => {
         if (snapshot.exists()) {
           const data = snapshot.data();
           setSettings({
            timezone: data.settings?.timezone ?? defaultSettings.timezone,
             defaultProtocol: data.settings?.defaultProtocol ?? null,
           });
         } else {
          setSettings(defaultSettings);
         }
         setLoading(false);
       },
       (error) => {
         console.error("Error fetching user settings:", error);
         setLoading(false);
       }
     );
 
     return () => unsubscribe();
   }, [uid]);
 
  if (!uid) {
    return { settings: null, loading: false };
  }

   return { settings, loading };
 }
