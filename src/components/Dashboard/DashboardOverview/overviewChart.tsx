"use client";

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Tooltip,
  Legend,
  CartesianGrid,
  TooltipProps,
} from "recharts";
import { Account, SnapshotDataPoint } from "@/lib/types";
import { useMemo, useState, useCallback, useEffect } from "react";
import { fetchSnapshotsInRange } from "@/server/actions/snapshots/fetchSnapshotsInRange";
import { useCurrency } from "@/lib/contexts/CurrencyContext";
import { convertCurrency } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/useDebounce";

// Define time range options
const TIME_RANGES = [
  { label: "Last Month", value: "1m" },
  { label: "Last 3 Months", value: "3m" },
  { label: "Last 6 Months", value: "6m", default: true },
  { label: "Year to Date", value: "ytd" },
  { label: "Last Year", value: "1y" },
  { label: "All Time", value: "all" },
];

// Define metric options
const METRICS = [
  { label: "Net Total", value: "netTotal", color: "#adfa1d", default: true },
  { label: "Liquid Assets", value: "liquidAssets", color: "#4299e1" },
  { label: "Savings", value: "savings", color: "#38a169" },
  { label: "Liabilities", value: "liabilities", color: "#e53e3e" },
  { label: "Total Assets", value: "totalAssets", color: "#805ad5" },
];

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
  currencySymbol,
}: TooltipProps<number, string> & { currencySymbol: string }) => {
  if (active && payload && payload.length) {
    // Get the full date from the payload
    const fullDate = payload[0]?.payload?.date
      ? new Date(payload[0].payload.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : label;

    return (
      <div className="rounded-md border border-border bg-card p-3 shadow-md">
        <p className="mb-2 font-medium">{fullDate}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className="text-sm">{entry.name}:</span>
              </div>
              <span className="text-sm font-medium">
                {currencySymbol}
                {Math.abs(Number(entry.value)).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// Function to aggregate data points when there are too many
const aggregateDataPoints = (data: SnapshotDataPoint[], maxPoints = 50) => {
  if (data.length <= maxPoints) return data;

  const result: SnapshotDataPoint[] = [];
  const interval = Math.ceil(data.length / maxPoints);

  for (let i = 0; i < data.length; i += interval) {
    const chunk = data.slice(i, i + interval);
    // Ensure we're not using undefined by using the first item as fallback
    const aggregated = chunk[chunk.length - 1] || chunk[0];
    if (aggregated) {
      result.push(aggregated);
    }
  }

  return result;
};

export function OverviewChart({
  accounts,
  snapshotData: initialSnapshotData,
}: {
  accounts: Account[];
  snapshotData: SnapshotDataPoint[];
}) {
  const { usdRate, goldRate, selectedCurrency } = useCurrency();
  // State for selected time range and metrics
  const [timeRange, setTimeRange] = useState<string>(
    TIME_RANGES.find((range) => range.default)?.value || "6m",
  );
  // Debounce time range changes to prevent rapid API calls
  const debouncedTimeRange = useDebounce(timeRange, 300);

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    METRICS.filter((metric) => metric.default).map((metric) => metric.value),
  );

  // State for snapshot data that will be updated based on time range
  const [snapshotData, setSnapshotData] =
    useState<SnapshotDataPoint[]>(initialSnapshotData);
  const [isLoading, setIsLoading] = useState(false);

  // Create a cache for data per time range
  const [dataCache, setDataCache] = useState<
    Record<string, SnapshotDataPoint[]>
  >({});

  // Memoize date calculations for each time range to avoid recalculations
  const getDateRange = useCallback((range: string) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (range) {
      case "1m":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "ytd":
        startDate = new Date(endDate.getFullYear(), 0, 1); // Jan 1 of current year
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "all":
        startDate = new Date(0); // Beginning of time (effectively)
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6); // Default to 6 months
    }

    return { startDate, endDate };
  }, []);

  // Function to fetch data based on time range with caching
  const fetchDataForTimeRange = useCallback(
    async (range: string) => {
      // Check cache first
      if (dataCache[range]) {
        setSnapshotData(dataCache[range]);
        return;
      }

      try {
        setIsLoading(true);
        const { startDate, endDate } = getDateRange(range);

        // Fetch new data with the calculated date range
        const data = await fetchSnapshotsInRange(startDate, endDate);

        // Aggregate data if there are too many points
        const processedData = aggregateDataPoints(data);

        // Update cache and state
        setDataCache((prev) => ({ ...prev, [range]: processedData }));
        setSnapshotData(processedData);
      } catch (error) {
        console.error("Error fetching snapshot data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [dataCache, getDateRange],
  );

  // Effect to fetch data when debounced time range changes
  useEffect(() => {
    fetchDataForTimeRange(debouncedTimeRange);
  }, [debouncedTimeRange, fetchDataForTimeRange]);

  // Handle time range change
  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
  };

  // Pre-convert currency data for all data points once, instead of during render
  const processedData = useMemo(() => {
    // If no snapshot data available, return empty array
    if (!snapshotData || snapshotData.length === 0) {
      return [];
    }

    // Filter out snapshots with zero rates to avoid division by zero or invalid data
    const validSnapshots = snapshotData.filter(
      (snapshot) =>
        snapshot.metrics.usdRate > 0 && snapshot.metrics.goldRate > 0,
    );

    // Process real snapshot data
    return validSnapshots.map((snapshot) => {
      // Format the date to show month name (e.g., "Jan", "Feb")
      const date = new Date(snapshot.date);
      const monthName = date.toLocaleString("default", { month: "short" });
      // If we have year data spanning multiple years, include the year in the label
      const needsYear = validSnapshots.some(
        (s) =>
          new Date(s.date).getFullYear() !==
          new Date(snapshot.date).getFullYear(),
      );
      const displayName = needsYear
        ? `${monthName} ${date.getFullYear()}`
        : monthName;

      return {
        name: displayName,
        date: date.toISOString().split("T")[0], // Keep the full date for tooltip
        netTotal: convertCurrency(
          snapshot.metrics.netTotal,
          "EGP", // Base currency used in calculations
          selectedCurrency,
          snapshot.metrics.usdRate,
          snapshot.metrics.goldRate,
        ),
        liquidAssets: convertCurrency(
          snapshot.metrics.liquidAssets,
          "EGP", // Base currency used in calculations
          selectedCurrency,
          snapshot.metrics.usdRate,
          snapshot.metrics.goldRate,
        ),
        savings: convertCurrency(
          snapshot.metrics.savings,
          "EGP", // Base currency used in calculations
          selectedCurrency,
          snapshot.metrics.usdRate,
          snapshot.metrics.goldRate,
        ),
        liabilities: convertCurrency(
          snapshot.metrics.liabilities,
          "EGP", // Base currency used in calculations
          selectedCurrency,
          snapshot.metrics.usdRate,
          snapshot.metrics.goldRate,
        ),
        totalAssets: convertCurrency(
          snapshot.metrics.totalAssets,
          "EGP", // Base currency used in calculations
          selectedCurrency,
          snapshot.metrics.usdRate,
          snapshot.metrics.goldRate,
        ),
      };
    });
  }, [snapshotData, selectedCurrency, usdRate, goldRate]);

  // Calculate Y-axis domain with padding for better visualization
  const yAxisDomain = useMemo(() => {
    if (processedData.length === 0 || selectedMetrics.length === 0) {
      return ["auto", "auto"];
    }

    // Find min and max values across all selected metrics
    let minValue = Infinity;
    let maxValue = -Infinity;

    processedData.forEach((dataPoint) => {
      selectedMetrics.forEach((metric) => {
        const value = dataPoint[metric as keyof typeof dataPoint];
        if (typeof value === "number") {
          minValue = Math.min(minValue, value);
          maxValue = Math.max(maxValue, value);
        }
      });
    });

    // If we have valid min/max, add padding
    if (minValue !== Infinity && maxValue !== -Infinity) {
      const paddingFactor = 0.1; // 10% padding (reduced from 15%)
      const range = maxValue - minValue;

      // Special handling for ranges that include both positive and negative values
      if (minValue < 0 && maxValue > 0) {
        // For mixed ranges, add padding proportionally
        return [
          minValue - Math.abs(minValue) * paddingFactor,
          maxValue + Math.abs(maxValue) * paddingFactor,
        ];
      }

      // If all values are positive, ensure min starts at 0 unless values are far from zero
      if (minValue >= 0) {
        const adjustedMin =
          minValue < range * 0.2 ? 0 : minValue - range * paddingFactor;
        const adjustedMax = maxValue + range * paddingFactor;
        return [adjustedMin, adjustedMax];
      }

      // If all values are negative, ensure max ends at 0 unless values are far from zero
      if (maxValue <= 0) {
        const adjustedMin = minValue - range * paddingFactor;
        const adjustedMax =
          maxValue > -range * 0.2 ? 0 : maxValue + range * paddingFactor;
        return [adjustedMin, adjustedMax];
      }
    }

    return ["auto", "auto"];
  }, [processedData, selectedMetrics]);

  // Format large numbers for Y-axis
  const formatYAxisTick = (value: number) => {
    // Handle zero separately
    if (value === 0) return `${currencySymbol}0`;

    // Format based on magnitude
    if (Math.abs(value) >= 1_000_000) {
      return `${currencySymbol}${(value / 1_000_000).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      })}M`;
    } else if (Math.abs(value) >= 1_000) {
      return `${currencySymbol}${(value / 1_000).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      })}K`;
    } else {
      return `${currencySymbol}${value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }
  };

  // Default currency (use the first account's currency or USD as fallback)
  const currencySymbol =
    selectedCurrency === "USD" ? "$" : selectedCurrency === "EGP" ? "E£" : "G";

  // Helper function to get color for a metric
  const getMetricColor = (metricValue: string) => {
    return (
      METRICS.find((metric) => metric.value === metricValue)?.color || "#adfa1d"
    );
  };

  // Handle metric selection
  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) => {
      // If metric is already selected, remove it (unless it's the last one)
      if (prev.includes(metric) && prev.length > 1) {
        return prev.filter((m) => m !== metric);
      }
      // If not selected, add it
      else if (!prev.includes(metric)) {
        return [...prev, metric];
      }
      // If it's the only one and trying to deselect, keep it
      return prev;
    });
  };

  // If data is loading, show loading state
  if (isLoading) {
    return (
      <div className="flex h-[250px] items-center justify-center text-center">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    );
  }

  // If no data is available
  if (processedData.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-center">
        <p className="text-muted-foreground">
          No data available for the selected time range. Try a different range
          or add accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Financial Overview</h3>

      {/* Controls for time range and metrics */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        {/* Time range selector */}
        <div className="flex flex-wrap gap-2">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => handleTimeRangeChange(range.value)}
              className={`rounded px-3 py-1 text-sm ${
                timeRange === range.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Metrics selector */}
        <div className="flex flex-wrap gap-2">
          {METRICS.map((metric) => (
            <button
              key={metric.value}
              onClick={() => toggleMetric(metric.value)}
              className={`flex items-center gap-2 rounded px-3 py-1 text-sm ${
                selectedMetrics.includes(metric.value)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px] sm:h-[300px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxisTick}
              domain={yAxisDomain}
              padding={{ top: 10, bottom: 10 }}
              width={60}
              tickCount={5}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip currencySymbol={currencySymbol} />}
            />
            <Legend />

            {/* Render selected metrics as line series */}
            {selectedMetrics.map((metric) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                name={METRICS.find((m) => m.value === metric)?.label || metric}
                stroke={getMetricColor(metric)}
                strokeWidth={2}
                dot={{ strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
