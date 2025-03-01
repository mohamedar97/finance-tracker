import { CreateAccountDialog } from "../AccountForm/CreateAccountDialog";
import { Account } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { createSnapshot } from "@/server/actions/snapshots/createSnapshot";
import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

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
    <div className="flex w-full flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
      <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
      <div className="flex w-full gap-2 sm:w-auto">
        <Button
          onClick={handleCreateSnapshot}
          disabled={isCreatingSnapshot}
          variant="outline"
          className="flex-1 justify-center sm:flex-auto sm:px-4"
          size="sm"
        >
          <Save className="size-4 sm:mr-2" />
          <span className="hidden sm:inline">
            {isCreatingSnapshot ? "Creating..." : "Save Snapshot"}
          </span>
          <span className="sm:hidden">
            {isCreatingSnapshot ? "..." : "Snapshot"}
          </span>
        </Button>
        <CreateAccountDialog onAddAccount={onAddAccount} />
      </div>
    </div>
  );
}
