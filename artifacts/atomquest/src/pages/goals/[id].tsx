import { useGetGoal, getGetGoalQueryOptions } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GoalDetail() {
  const [, params] = useRoute("/goals/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: goal, isLoading } = useGetGoal(id, {
    query: {
      ...getGetGoalQueryOptions(id),
      enabled: !!id,
    },
  });

  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-12 w-1/3"/><Skeleton className="h-64 w-full"/></div>;
  if (!goal) return <div className="p-8">Goal not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{goal.goalTitle}</h1>
        <p className="text-muted-foreground mt-2">{goal.goalDescription}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Thrust Area</div>
              <div className="font-medium">{goal.thrustArea}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Weightage</div>
              <div className="font-medium">{goal.weightage}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Target</div>
              <div className="font-medium">{goal.target}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="font-medium capitalize">{goal.approvalStatus}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
