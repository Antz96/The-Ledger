"use client";

import { useLedgerData } from "@/lib/LedgerDataContext";
import AssetsTab from "@/components/tabs/AssetsTab";

export default function AssetsPage() {
  const { assets, liabilities, handleAddAsset, handleUpdateAsset, handleDeleteAsset } = useLedgerData();

  return (
    <AssetsTab
      assets={assets}
      liabilities={liabilities}
      onAddAsset={handleAddAsset}
      onUpdateAsset={handleUpdateAsset}
      onDeleteAsset={handleDeleteAsset}
    />
  );
}
