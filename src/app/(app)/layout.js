"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/useSession";
import { LedgerDataProvider, useLedgerData } from "@/lib/LedgerDataContext";
import AppShell from "@/components/AppShell";

function Loading() {
  return (
    <div className="flex items-center justify-center flex-1 min-h-[100dvh] text-[var(--muted)]">
      <Loader2 className="animate-spin mr-2" size={20} /> Loading…
    </div>
  );
}

function AppContent({ children }) {
  const { loading, profile } = useLedgerData();
  const router = useRouter();
  const pathname = usePathname();
  const isAssessment = pathname === "/assessment";
  const needsOnboarding = !!profile && !profile.onboarding_complete;

  useEffect(() => {
    if (!loading && needsOnboarding && !isAssessment) {
      router.replace("/assessment");
    }
  }, [loading, needsOnboarding, isAssessment, router]);

  if (loading) return <Loading />;
  if (isAssessment) return children;
  if (needsOnboarding) return <Loading />;
  return <AppShell>{children}</AppShell>;
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
      <AppContent>{children}</AppContent>
    </LedgerDataProvider>
  );
}
