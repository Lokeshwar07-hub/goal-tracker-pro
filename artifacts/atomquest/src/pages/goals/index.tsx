import { useListGoals } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Goals() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  
  const { data: goals, isLoading } = useListGoals();

  const filteredGoals = goals?.filter(g => 
    g.goalTitle.toLowerCase().includes(search.toLowerCase()) ||
    g.thrustArea.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
      case 'approved': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'returned': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      default: return 'bg-primary/10 text-primary hover:bg-primary/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.role === 'manager' ? 'Team Goals' : 'My Goals'}
          </h1>
          <p className="text-muted-foreground mt-1">Manage and track objective progress.</p>
        </div>
        
        {user?.role === 'employee' && (
          <Link href="/goals/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search goals..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : filteredGoals?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <Target className="w-12 h-12 text-muted-foreground opacity-50" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">No goals found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                {search ? "We couldn't find any goals matching your search." : "You haven't set any goals for this quarter yet."}
              </p>
            </div>
            {!search && user?.role === 'employee' && (
              <Link href="/goals/new">
                <Button variant="outline" className="mt-2">Create your first goal</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredGoals?.map(goal => (
            <Card key={goal.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = `/goals/${goal.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{goal.goalTitle}</h3>
                      <Badge variant="secondary" className={getStatusColor(goal.approvalStatus)}>
                        {goal.approvalStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground">{goal.thrustArea}</span>
                      <span>Weightage: <strong className="text-foreground">{goal.weightage}%</strong></span>
                      {user?.role !== 'employee' && goal.employeeName && (
                        <span>Owner: <strong className="text-foreground">{goal.employeeName}</strong></span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 min-w-32">
                    <div className="text-sm font-medium">Progress</div>
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all" 
                          style={{ width: `${goal.progressScore || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{goal.progressScore || 0}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Temporary icon
const Target = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
