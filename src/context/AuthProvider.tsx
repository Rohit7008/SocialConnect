"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type UserInfo = {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
} | null;

type AuthContextValue = {
  user: UserInfo;
  loading: boolean;
  setUser: (u: UserInfo) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // attempt to get current user info using access token by calling /api/users/me
    (async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("access") : null;
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setUser(null);
        } else {
          const me = await res.json();
          setUser({
            id: me.id,
            username: me.username,
            email: me.email,
            role: me.role,
          });
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      logout: () => {
        try {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
        } catch {}
        setUser(null);
        if (typeof window !== "undefined") window.location.href = "/";
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
