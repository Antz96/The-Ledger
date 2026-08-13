"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import AssetsTab from "@/components/tabs/AssetsTab";

export default function AssetsPage() {
  const {
    assets,
    liabilities,
    handleAddAsset,
    handleUpdateAsset,
    handleDeleteAsset,
    handleAddLiability,
    handleUpdateLiability,
    handleDeleteLiability,
  } = useLedgerData();

  return (
    <AssetsTab
      assets={assets}
      liabilities={liabilities}
      onAddAsset={handleAddAsset}
      onUpdateAsset={handleUpdateAsset}
      onDeleteAsset={handleDeleteAsset}
      onAddLiability={handleAddLiability}
      onUpdateLiability={handleUpdateLiability}
      onDeleteLiability={handleDeleteLiability}
    />
  );
}
