import { getRedirectResult, onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useRef, useState } from "react";

import { auth } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const redirectUserRef = useRef<User | null>(null);
  const hasAuthUserRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let authStateReady = false;
    let redirectReady = false;

    const finalize = () => {
      if (!isMounted) return;
      if (authStateReady && redirectReady) {
        setLoading(false);
      }
    };

    getRedirectResult(auth)
      .then((result) => {
        if (!isMounted) return;
        if (result?.user) {
          redirectUserRef.current = result.user;
          setUser(result.user);
        }
        redirectReady = true;
        finalize();
      })
      .catch((redirectError) => {
        if (!isMounted) return;
        setError(redirectError);
        redirectReady = true;
        finalize();
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;
      if (currentUser) {
        hasAuthUserRef.current = true;
        redirectUserRef.current = currentUser;
        setUser(currentUser);
      } else if (!hasAuthUserRef.current && redirectUserRef.current) {
        setUser(redirectUserRef.current);
      } else {
        redirectUserRef.current = null;
        setUser(null);
      }
      authStateReady = true;
      finalize();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { user, loading, error };
}
