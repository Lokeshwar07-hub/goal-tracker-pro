import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !token) {
      setLocation("/login");
    }
  }, [isLoading, token, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || !token) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
