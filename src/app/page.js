"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/useSession";
import AuthForm from "@/components/AuthForm";

export default function Home() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.replace("/dashboard");
  }, [session, router]);

  if (session === undefined || session) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-[100dvh] text-[#5B5541]">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading…
      </div>
    );
  }

  return <AuthForm />;
}
