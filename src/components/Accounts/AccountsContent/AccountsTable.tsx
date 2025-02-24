import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Account } from "../types";
import { EditAccountDialog } from "../AccountForm/EditAccountDialog";

interface AccountsTableProps {
  accounts: Account[];
  onEditAccount: (id: string, updatedData: Partial<Account>) => void;
}

export function AccountsTable({ accounts, onEditAccount }: AccountsTableProps) {
  return (
    <div className="hidden sm:block">
      <ScrollArea className="h-[calc(100vh-500px)] min-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">Account Name</TableHead>
              <TableHead className="w-[10%]">Type</TableHead>
              <TableHead className="w-[15%] text-right">Balance</TableHead>
              <TableHead className="w-[10%]">Currency</TableHead>
              <TableHead className="w-[10%]">Status</TableHead>
              <TableHead className="w-[15%]">Last Updated</TableHead>
              <TableHead className="w-[10%]">Created</TableHead>
              <TableHead className="w-[5%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No accounts found.
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow
                  key={account.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.type}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      account.isLiability ? "text-red-500" : ""
                    }`}
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: account.currency,
                      signDisplay: account.isLiability ? "never" : "auto",
                    }).format(Math.abs(account.balance))}
                    {account.isLiability ? " (debt)" : ""}
                  </TableCell>
                  <TableCell>{account.currency}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ${
                        account.isLiability
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {account.isLiability ? "Liability" : "Asset"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(account.lastUpdated).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(account.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <EditAccountDialog
                      account={account}
                      onEditAccount={onEditAccount}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
