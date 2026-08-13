"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Returns undefined while the initial check is in flight, null when signed
// out, or the Supabase session object once signed in. Centralized here so
// both the signed-out entry page and the authenticated app shell watch the
// exact same auth state instead of duplicating the listener.
export function useSession() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  return session;
}
