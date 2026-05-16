import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Goals from "@/pages/goals";
import GoalDetail from "@/pages/goals/[id]";
import NewGoal from "@/pages/goals/new";
import Team from "@/pages/team";
import Approvals from "@/pages/approvals";
import QuarterlyCheckIns from "@/pages/quarterly";
import Analytics from "@/pages/analytics";
import Reports from "@/pages/reports";
import AuditLogs from "@/pages/audit-logs";
import Notifications from "@/pages/notifications";
import AdminUsers from "@/pages/admin/users";
import AdminDepartments from "@/pages/admin/departments";
import AdminQuarters from "@/pages/admin/quarters";
import AdminEscalations from "@/pages/admin/escalations";
import SharedGoals from "@/pages/shared-goals";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/goals" component={Goals} />
        <Route path="/goals/new" component={NewGoal} />
        <Route path="/goals/:id" component={GoalDetail} />
        <Route path="/team" component={Team} />
        <Route path="/approvals" component={Approvals} />
        <Route path="/quarterly" component={QuarterlyCheckIns} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/reports" component={Reports} />
        <Route path="/audit-logs" component={AuditLogs} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/departments" component={AdminDepartments} />
        <Route path="/admin/quarters" component={AdminQuarters} />
        <Route path="/admin/escalations" component={AdminEscalations} />
        <Route path="/shared-goals" component={SharedGoals} />
        <Route path="/settings" component={Settings} />
        <Route path="/" component={() => { return <Redirect to="/dashboard" />; }} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="*">
        <ProtectedRoute>
          <ProtectedRoutes />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
