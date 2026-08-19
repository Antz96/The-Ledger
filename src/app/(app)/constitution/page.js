"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import ConstitutionTab from "@/components/tabs/ConstitutionTab";

export default function ConstitutionPage() {
  const { financialConstitution, transactions, assets, handleSaveConstitution } = useLedgerData();
  return (
    <ConstitutionTab
      constitution={financialConstitution}
      transactions={transactions}
      assets={assets}
      onSave={handleSaveConstitution}
    />
  );
}
