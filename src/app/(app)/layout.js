"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/useSession";
import { LedgerDataProvider } from "@/lib/LedgerDataContext";
import AppShell from "@/components/AppShell";

function Loading() {
  return (
    <div className="flex items-center justify-center flex-1 min-h-[100dvh] text-[#5B5541]">
      <Loader2 className="animate-spin mr-2" size={20} /> Loading…
    </div>
  );
}

export default function AppLayout({ children }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session === null) router.replace("/");
  }, [session, router]);

  if (session === undefined || session === null) return <Loading />;

  return (
    <LedgerDataProvider session={session}>
      <AppShell>{children}</AppShell>
    </LedgerDataProvider>
  );
}
