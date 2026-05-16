import { useListGoals, useApproveGoal, useRejectGoal, useReturnGoal, getListGoalsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Undo } from "lucide-react";

export default function Approvals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: goals, isLoading } = useListGoals({ approvalStatus: 'pending' });

  const approveGoal = useApproveGoal({
    mutation: {
      onSuccess: () => {
        toast({ title: "Goal approved" });
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
      }
    }
  });

  const rejectGoal = useRejectGoal({
    mutation: {
      onSuccess: () => {
        toast({ title: "Goal rejected" });
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
      }
    }
  });

  const returnGoal = useReturnGoal({
    mutation: {
      onSuccess: () => {
        toast({ title: "Goal returned for revision" });
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
      }
    }
  });

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
        <p className="text-muted-foreground mt-1">Review goals submitted by your team.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid gap-4">
          {goals.map(goal => (
            <Card key={goal.id}>
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{goal.goalTitle}</h3>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">Pending</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm max-w-2xl">{goal.goalDescription}</p>
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <span>Owner: {goal.employeeName}</span>
                    <span>Thrust Area: {goal.thrustArea}</span>
                    <span>Target: {goal.target} {goal.unitOfMeasurement === 'percentage' ? '%' : ''}</span>
                    <span>Weight: {goal.weightage}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                    onClick={() => returnGoal.mutate({ id: goal.id, data: { comment: "Please revise" }})}
                    disabled={returnGoal.isPending || approveGoal.isPending || rejectGoal.isPending}
                  >
                    <Undo className="w-4 h-4 mr-2" />
                    Return
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => rejectGoal.mutate({ id: goal.id, data: { comment: "Rejected" }})}
                    disabled={returnGoal.isPending || approveGoal.isPending || rejectGoal.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => approveGoal.mutate({ id: goal.id, data: { comment: "Approved" }})}
                    disabled={returnGoal.isPending || approveGoal.isPending || rejectGoal.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <CheckCircle className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold">All caught up</h3>
            <p className="text-muted-foreground">There are no pending goals awaiting your approval.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
