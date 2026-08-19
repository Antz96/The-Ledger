"use client";

import { Target } from "lucide-react";
import { useLedgerData } from "@/lib/LedgerDataContext";
import GoalsTab from "@/components/tabs/GoalsTab";
import ConstitutionTab from "@/components/tabs/ConstitutionTab";

export default function GoalsPage() {
  const {
    financialGoals, handleAddFinancialGoal, handleUpdateFinancialGoal, handleDeleteFinancialGoal,
    financialConstitution, transactions, assets, handleSaveConstitution,
  } = useLedgerData();

  return (
    <div className="space-y-8">
      <div>
        <p className="serif text-sm tracking-wide text-[var(--muted)] mb-3 flex items-center gap-1.5">
          <Target size={15} /> Goals
        </p>
        <GoalsTab
          goals={financialGoals}
          onAdd={handleAddFinancialGoal}
          onUpdate={handleUpdateFinancialGoal}
          onDelete={handleDeleteFinancialGoal}
        />
      </div>

      <div className="pt-6 border-t" style={{ borderColor: "var(--line)" }}>
        <ConstitutionTab
          constitution={financialConstitution}
          transactions={transactions}
          assets={assets}
          onSave={handleSaveConstitution}
        />
      </div>
    </div>
  );
}
