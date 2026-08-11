"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import AuthForm from "@/components/AuthForm";
import LedgerApp from "@/components/LedgerApp";

export default function Home() {
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-[100dvh] text-[#5B5541]">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading…
      </div>
    );
  }

  return session ? <LedgerApp session={session} /> : <AuthForm />;
}
