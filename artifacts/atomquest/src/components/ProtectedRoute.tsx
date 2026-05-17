import { Redirect } from "wouter";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAuth();

  // Still resolving the session — show a centered spinner.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // BUG FIX: Previously the check was `!token || !user`.  When AuthContext
  // clears an expired token the state updates are async; for one render cycle
  // `token` could be null while `user` still has the stale localStorage value
  // (or vice-versa).  Checking BOTH together is still correct, but the real
  // fix is in AuthContext — user is now initialised from localStorage so these
  // two values are always in sync by the time isLoading is false.
  if (!token || !user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
