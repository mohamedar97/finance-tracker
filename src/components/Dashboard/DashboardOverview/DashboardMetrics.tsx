import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardMetrics() {
  return (
    <div className="flex flex-col justify-between md:flex-row md:gap-4">
      <Card className="mb-4 w-full md:mb-0 md:w-1/3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Liquid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p>
        </CardContent>
      </Card>
      <Card className="mb-4 w-full md:mb-0 md:w-1/3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$17,405.15</div>
          <p className="text-xs text-muted-foreground">
            +180.1% from last month
          </p>
        </CardContent>
      </Card>
      <Card className="w-full md:w-1/3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$62,637.04</div>
          <p className="text-xs text-muted-foreground">+19% from last month</p>
        </CardContent>
      </Card>
    </div>
  );
}
