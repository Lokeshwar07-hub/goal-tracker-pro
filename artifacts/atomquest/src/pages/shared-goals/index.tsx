import { useListSharedGoals } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Users } from "lucide-react";

export default function SharedGoals() {
  const { data: sharedGoals, isLoading } = useListSharedGoals();

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shared Goals</h1>
          <p className="text-muted-foreground mt-1">Cross-functional and departmental objectives.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-4">
          {sharedGoals?.map(goal => (
            <Card key={goal.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">{goal.goalTitle}</h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">Shared</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-2xl">{goal.goalDescription}</p>
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <span>Owner: {goal.primaryOwnerName}</span>
                      <span>Target: {goal.target}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {goal.linkedEmployeeIds?.length || 0} participants
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 min-w-32">
                    <div className="text-sm font-medium">Progress</div>
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${goal.achievement ? Math.min((goal.achievement / goal.target) * 100, 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">
                        {goal.achievement ? Math.min((goal.achievement / goal.target) * 100, 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!sharedGoals || sharedGoals.length === 0) && (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-64 text-center text-muted-foreground">
                No shared goals active right now.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
