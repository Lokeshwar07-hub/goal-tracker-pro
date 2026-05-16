import { useGetDepartmentPerformance, useGetQuarterTrend, useGetUomBreakdown, useGetGoalCompletion } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

export default function Analytics() {
  const { data: deptPerf, isLoading: isLoadingDept } = useGetDepartmentPerformance();
  const { data: trends, isLoading: isLoadingTrends } = useGetQuarterTrend();
  const { data: uomStats, isLoading: isLoadingUom } = useGetUomBreakdown();
  const { data: completion, isLoading: isLoadingComp } = useGetGoalCompletion();

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Insights into organizational goal performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingDept ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptPerf || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="department" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg Score %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quarterly Trends */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quarterly Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingTrends ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="quarter" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--chart-2))" strokeWidth={3} name="Avg Score %" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Goal Completion */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Goal Completion Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingComp ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={completion || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="percentage" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.3} name="Completion %" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* UoM Breakdown */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Measurement Types</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingUom ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={uomStats || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="uom"
                    label={({ uom, percent }) => `${uom} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(uomStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
