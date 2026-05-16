import { useListGoals } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function QuarterlyCheckIns() {
  const { data: goals, isLoading } = useListGoals();

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-teal-500/10 text-teal-500';
      case 'on_track': return 'bg-green-500/10 text-green-500';
      case 'behind': return 'bg-red-500/10 text-red-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quarterly Check-ins</h1>
          <p className="text-muted-foreground mt-1">Update achievements and status for current goals.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-4">
          {goals?.filter(g => g.approvalStatus === 'approved').map(goal => {
            const currentUpdate = goal.quarterlyUpdates?.[0];
            const status = currentUpdate?.progressStatus || 'not_started';
            
            return (
              <Card key={goal.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{goal.goalTitle}</h3>
                        <Badge variant="secondary" className={getProgressColor(status)}>
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-medium">
                        <span>Target: {goal.target} {goal.unitOfMeasurement === 'percentage' ? '%' : ''}</span>
                        <span>Current Achievement: {goal.achievement || 0}</span>
                      </div>
                    </div>
                    <Button>Update Progress</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {goals?.filter(g => g.approvalStatus === 'approved').length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-64 text-center text-muted-foreground">
                No approved goals found to update.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
