import { CreateAccountDialog } from "../AccountForm/CreateAccountDialog";
import { Account } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { createSnapshot } from "@/server/actions/snapshots/createSnapshot";
import { useState } from "react";
import { toast } from "sonner";

interface AccountsHeaderProps {
  onAddAccount: (accountData: Account) => void;
}

export function AccountsHeader({ onAddAccount }: AccountsHeaderProps) {
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  async function handleCreateSnapshot() {
    try {
      setIsCreatingSnapshot(true);
      // Create snapshot using today's date (handled in the server action)
      const result = await createSnapshot();

      if (result.success) {
        toast.success("Financial snapshot has been saved successfully.");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create snapshot",
      );
    } finally {
      setIsCreatingSnapshot(false);
    }
  }

  return (
    <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
      <div className="flex gap-2">
        <Button
          onClick={handleCreateSnapshot}
          disabled={isCreatingSnapshot}
          variant="outline"
        >
          {isCreatingSnapshot ? "Creating..." : "Save Snapshot"}
        </Button>
        <CreateAccountDialog onAddAccount={onAddAccount} />
      </div>
    </div>
  );
}
