import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Liquid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-muted-foreground text-xs">
            +20.1% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$17,405.15</div>
          <p className="text-muted-foreground text-xs">
            +180.1% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$62,637.04</div>
          <p className="text-muted-foreground text-xs">+19% from last month</p>
        </CardContent>
      </Card>
    </div>
  );
}
