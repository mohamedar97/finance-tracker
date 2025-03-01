export const dynamic = "force-dynamic";
import History from "@/components/History";
import { getAllSnapshots } from "@/server/actions/snapshots/getAllSnapshots";
import { HistorySnapshot } from "@/lib/types";

export default async function HistoryPage() {
  // Get initial page of snapshots with page size of 10
  const snapshotsRequest = await getAllSnapshots(1, 10);

  if (!snapshotsRequest.success) {
    throw new Error(snapshotsRequest.error);
  }

  const snapshots = (snapshotsRequest.snapshots as HistorySnapshot[]) || [];
  const hasMore = snapshotsRequest.hasMore || false;
  const totalCount = snapshotsRequest.totalCount || 0;

  return (
    <History snapshots={snapshots} hasMore={hasMore} totalCount={totalCount} />
  );
}
