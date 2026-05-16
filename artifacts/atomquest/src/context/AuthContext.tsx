import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, User, setAuthTokenGetter } from "@workspace/api-client-react";

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
  
  const [user, setUser] = useState<User | null>(null);

  // Set the token getter for the API client
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("atomquest_token"));
  }, []);

  const { data: fetchedUser, isLoading: isUserLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
  });

  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
    }
  }, [fetchedUser]);

  useEffect(() => {
    if (token && !fetchedUser && !isUserLoading) {
       // if token exists but fetch failed (e.g., expired token)
       const storedUserStr = localStorage.getItem("atomquest_user");
       if(storedUserStr) {
           try {
               const parsed = JSON.parse(storedUserStr);
               setUser(parsed);
           } catch(e) {}
       }
    }
  }, [token, fetchedUser, isUserLoading]);


  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("atomquest_token", newToken);
    localStorage.setItem("atomquest_user", JSON.stringify(newUser));
    setTokenState(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("atomquest_token");
    localStorage.removeItem("atomquest_user");
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading: isUserLoading && !!token && !user }}>
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
