"use client";
import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HistorySnapshot } from "@/lib/types";
import { formatCurrency, convertCurrency } from "@/lib/utils";
import { useCurrency } from "@/lib/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Search, Loader2, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  getAllSnapshots,
  getAllSnapshotsWithoutPagination,
} from "@/server/actions/snapshots/getAllSnapshots";

interface HistoryProps {
  snapshots: HistorySnapshot[];
  hasMore?: boolean;
  totalCount?: number;
}

const History = ({
  snapshots,
  hasMore: initialHasMore = false,
  totalCount,
}: HistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allSnapshots, setAllSnapshots] =
    useState<HistorySnapshot[]>(snapshots);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const { selectedCurrency, usdRate, goldRate } = useCurrency();

  // Filter snapshots based on search term (if searching by date)
  const filteredSnapshots = allSnapshots.filter((snapshot) => {
    const date = format(new Date(snapshot.snapshotDate), "PPP");
    return date.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Load more snapshots
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getAllSnapshots(nextPage, 10);

      if (result.success && result.snapshots) {
        setAllSnapshots((prev) => [...prev, ...(result.snapshots || [])]);
        setHasMore(result.hasMore || false);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more snapshots:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading]);

  // Load all remaining snapshots
  const loadAll = useCallback(async () => {
    if (!hasMore || isLoadingAll) return;

    setIsLoadingAll(true);
    try {
      // Calculate how many snapshots are remaining
      const loadedCount = allSnapshots.length;
      const remainingCount = (totalCount || 0) - loadedCount;

      if (remainingCount <= 0) {
        setHasMore(false);
        return;
      }

      // Calculate the page size needed to fetch all remaining snapshots
      // We'll fetch everything in one request
      const result = await getAllSnapshotsWithoutPagination();

      if (result.success && result.snapshots) {
        setAllSnapshots((prev) => [...(result.snapshots || [])]);
        setHasMore(false);
        setPage(Math.ceil((totalCount || 0) / 10)); // Update page to last page
      }
    } catch (error) {
      console.error("Error loading all snapshots:", error);
    } finally {
      setIsLoadingAll(false);
    }
  }, [page, hasMore, isLoadingAll, allSnapshots.length, totalCount]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">History</h2>
        {totalCount !== undefined && (
          <Badge variant="outline" className="ml-2">
            {totalCount} Total Snapshots
          </Badge>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by date..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredSnapshots.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No snapshots found
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Accordion type="multiple" className="w-full">
              {filteredSnapshots.map((snapshot) => (
                <AccordionItem key={snapshot.id} value={snapshot.id}>
                  <AccordionTrigger className="px-4">
                    <div className="flex flex-1 items-center justify-between pr-4">
                      <div className="font-medium">
                        {format(new Date(snapshot.snapshotDate), "PPP")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="ml-2">
                          {snapshot.accounts.length} Accounts
                        </Badge>
                        <Badge>
                          {`Net: ${formatCurrency(
                            convertCurrency(
                              snapshot.metrics.netTotal,
                              "EGP",
                              selectedCurrency,
                              snapshot.metrics.usdRate,
                              snapshot.metrics.goldRate,
                            ),
                            selectedCurrency,
                          )}`}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">
                          Snapshot Summary
                        </CardTitle>
                        <CardDescription>
                          Currency rates: USD = {snapshot.metrics.usdRate} EGP,
                          Gold = {snapshot.metrics.goldRate} EGP/g
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Liquid Assets
                            </p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(
                                convertCurrency(
                                  snapshot.metrics.liquidAssets,
                                  "EGP",
                                  selectedCurrency,
                                  snapshot.metrics.usdRate,
                                  snapshot.metrics.goldRate,
                                ),
                                selectedCurrency,
                              )}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Savings
                            </p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(
                                convertCurrency(
                                  snapshot.metrics.savings,
                                  "EGP",
                                  selectedCurrency,
                                  snapshot.metrics.usdRate,
                                  snapshot.metrics.goldRate,
                                ),
                                selectedCurrency,
                              )}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Liabilities
                            </p>
                            <p className="text-2xl font-bold">
                              {formatCurrency(
                                convertCurrency(
                                  snapshot.metrics.liabilities,
                                  "EGP",
                                  selectedCurrency,
                                  snapshot.metrics.usdRate,
                                  snapshot.metrics.goldRate,
                                ),
                                selectedCurrency,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h3 className="mb-2 text-lg font-semibold">
                            Accounts
                          </h3>
                          <Table className="w-4">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Original Balance</TableHead>
                                <TableHead className="text-right">
                                  In {selectedCurrency}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {snapshot.accounts.map((account) => (
                                <TableRow key={account.id}>
                                  <TableCell className="font-medium">
                                    {account.name}
                                  </TableCell>
                                  <TableCell>{account.type}</TableCell>
                                  <TableCell
                                    className={
                                      account.isLiability ? "text-red-500" : ""
                                    }
                                  >
                                    {formatCurrency(
                                      account.isLiability
                                        ? -Number(account.balance)
                                        : Number(account.balance),
                                      account.currency,
                                    )}
                                  </TableCell>
                                  <TableCell
                                    className={`text-right ${account.isLiability ? "text-red-500" : ""}`}
                                  >
                                    {formatCurrency(
                                      convertCurrency(
                                        account.isLiability
                                          ? -Number(account.balance)
                                          : Number(account.balance),
                                        account.currency,
                                        selectedCurrency,
                                        snapshot.metrics.usdRate,
                                        snapshot.metrics.goldRate,
                                      ),
                                      selectedCurrency,
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {hasMore && (
              <div className="mt-4 flex justify-center gap-2">
                <Button onClick={loadMore} disabled={isLoading || isLoadingAll}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
                <Button
                  onClick={loadAll}
                  disabled={isLoading || isLoadingAll}
                  variant="outline"
                >
                  {isLoadingAll ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading All...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Load All ({(totalCount || 0) - allSnapshots.length}{" "}
                      remaining)
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;
