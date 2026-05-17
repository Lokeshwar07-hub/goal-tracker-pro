import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  useGetMe,
  setAuthTokenGetter,
  getGetMeQueryOptions,
} from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("atomquest_token");
  });

  const [user, setUser] = useState<User | null>(() => {
    // BUG FIX: initialise user from localStorage immediately so the app
    // doesn't flash the spinner on every hard-refresh when a valid session
    // is already stored.
    const stored = localStorage.getItem("atomquest_user");
    if (stored) {
      try {
        return JSON.parse(stored) as User;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Register the token getter ONCE on mount so every API call sends the
  // Authorization header automatically.
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("atomquest_token"));
    return () => {
      // Clean up on unmount
      setAuthTokenGetter(null);
    };
  }, []);

  const {
    data: fetchedUser,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetMe({
    query: {
      ...getGetMeQueryOptions(),
      enabled: !!token,
      retry: false,
      // Don't re-fetch on window focus to avoid unnecessary 401s when the
      // token has expired and the user hasn't navigated yet.
      refetchOnWindowFocus: false,
    },
  });

  // Sync the freshly-fetched user into state and localStorage.
  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
      localStorage.setItem("atomquest_user", JSON.stringify(fetchedUser));
    }
  }, [fetchedUser]);

  // BUG FIX: When the /me request fails (expired / invalid token) we must
  // clear the stale token so ProtectedRoute redirects to /login instead of
  // spinning forever.
  useEffect(() => {
    if (isUserError && token) {
      localStorage.removeItem("atomquest_token");
      localStorage.removeItem("atomquest_user");
      setTokenState(null);
      setUser(null);
    }
  }, [isUserError, token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("atomquest_token", newToken);
    localStorage.setItem("atomquest_user", JSON.stringify(newUser));
    setAuthTokenGetter(() => newToken);
    setTokenState(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("atomquest_token");
    localStorage.removeItem("atomquest_user");
    setAuthTokenGetter(null);
    setTokenState(null);
    setUser(null);
  };

  // BUG FIX: isLoading was `isUserLoading && !!token && !user`.
  // When user is pre-loaded from localStorage (fixed above), this is already
  // false so there's no spinner flash.  When there's no token at all we
  // must NOT show loading — ProtectedRoute needs to redirect immediately.
  const isLoading = !!token && !user && isUserLoading;

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
