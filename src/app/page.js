"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import AuthForm from "@/components/AuthForm";
import LedgerApp from "@/components/LedgerApp";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function Home() {
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [recovery, setRecovery] = useState(false); // arrived via password-reset link

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
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

  if (session && recovery) {
    return <ResetPasswordForm onDone={() => setRecovery(false)} />;
  }

  return session ? <LedgerApp session={session} /> : <AuthForm />;
}
