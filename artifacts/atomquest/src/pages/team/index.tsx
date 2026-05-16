import { useGetMyTeam } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Team() {
  const { data: team, isLoading } = useGetMyTeam();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
        <p className="text-muted-foreground mt-1">View your direct reports and their performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team?.map(member => (
          <Card key={member.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = `/analytics`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {member.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.department}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">--</div>
                  <div className="text-xs text-muted-foreground">Goals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">--%</div>
                  <div className="text-xs text-muted-foreground">Avg Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!team || team.length === 0) && (
          <div className="col-span-full text-center p-12 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground">No team members found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
