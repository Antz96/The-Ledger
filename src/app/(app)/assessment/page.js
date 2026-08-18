"use client";

import { useRouter } from "next/navigation";
import { useLedgerData } from "@/lib/LedgerDataContext";
import AssessmentTab from "@/components/tabs/AssessmentTab";

export default function AssessmentPage() {
  const { saving, handleSubmitAssessment, handleAddAsset, handleAddLiability } = useLedgerData();
  const router = useRouter();

  async function onSubmit(responses, tags, goalNote, confirmedDrafts) {
    await handleSubmitAssessment(responses, tags, goalNote);
    for (const draft of confirmedDrafts) {
      if (draft.kind === "asset") {
        await handleAddAsset({ name: draft.name, category: draft.category, purpose: draft.purpose, value: draft.value });
      } else {
        await handleAddLiability({ name: draft.name, category: draft.category, balance: draft.value });
      }
    }
    router.replace("/welcome");
  }

  return <AssessmentTab onSubmit={onSubmit} saving={saving} />;
}
