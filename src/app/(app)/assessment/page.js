"use client";

import { useRouter } from "next/navigation";
import { useLedgerData } from "@/lib/LedgerDataContext";
import AssessmentTab from "@/components/tabs/AssessmentTab";

export default function AssessmentPage() {
  const { saving, handleSubmitAssessment } = useLedgerData();
  const router = useRouter();

  async function onSubmit(responses, tags, goalNote) {
    await handleSubmitAssessment(responses, tags, goalNote);
    router.replace("/dashboard");
  }

  return <AssessmentTab onSubmit={onSubmit} saving={saving} />;
}
