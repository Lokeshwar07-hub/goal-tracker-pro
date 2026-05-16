import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGetDashboardSummary, useGetPendingActions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: actions, isLoading: isLoadingActions } = useGetPendingActions();

  if (isLoadingSummary || isLoadingActions) {
    return (
      <div className="space-y-6 p-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening in your workspace today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalGoals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active in {summary?.currentQuarter || "current quarter"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.overallScore ? `${summary.overallScore.toFixed(1)}%` : '0%'}</div>
            <p className="text-xs text-muted-foreground mt-1">Average achievement</p>
          </CardContent>
        </Card>

        {user?.role === 'manager' || user?.role === 'admin' ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actions?.pendingApprovals || summary?.pendingApprovals || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Requires your review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.teamSize || summary?.totalEmployees || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Direct reports</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.completedGoals || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Goals achieved</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actions?.overdueGoals || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
