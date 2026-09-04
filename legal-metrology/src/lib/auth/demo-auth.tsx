"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface DemoUser {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "officer" | "viewer";
}

const DEMO_USERS: Record<string, DemoUser> = {
  "admin@demo.com": { id: "1", email: "admin@demo.com", full_name: "Admin User", role: "admin" },
  "officer@demo.com": { id: "2", email: "officer@demo.com", full_name: "Officer User", role: "officer" },
  "viewer@demo.com": { id: "3", email: "viewer@demo.com", full_name: "Viewer User", role: "viewer" },
};

const DEMO_PASSWORD = "demo123";

interface AuthContextType {
  user: DemoUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  login: async () => false,
  logout: () => {},
  isLoading: true,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("demo_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    
    const demoUser = DEMO_USERS[email];
    if (demoUser && password === DEMO_PASSWORD) {
      setUser(demoUser);
      localStorage.setItem("demo_user", JSON.stringify(demoUser));
      // Also set cookie via API call
      await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      setIsLoading(false);
      router.push("/dashboard");
      router.refresh();
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("demo_user");
    await fetch('/api/auth/demo-logout', { method: 'POST' });
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}