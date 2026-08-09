import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEMO_CREDENTIALS, ROLE_LABELS, ROLE_PERMISSIONS } from "@/constants";
import { initialsOf } from "@/utils/format";
import type { Permission, Role, User } from "@/types";
import api from "@/lib/api";

const SESSION_KEY = "nexora.erp.session.v1";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  roleLabel: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const buildUser = (role: Role, email: string): User => {
  const name =
    role === "ADMIN"
      ? "Trupti G C"
      : role === "SALES"
        ? "Aarav Mehta"
        : role === "WAREHOUSE"
          ? "Rakesh Yadav"
          : "Neha Bansal";
  return { id: role.toLowerCase(), name, email, role, avatarInitials: initialsOf(name) };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed.role === 'object' && parsed.role !== null) {
           parsed.role = (parsed.role.name || 'ADMIN').toUpperCase();
        }
        setUser(parsed as User);
      } catch {
        window.localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const roleStr = typeof response.data.user.role === 'string' 
          ? response.data.user.role 
          : response.data.user.role?.name || 'ADMIN';
        const loggedInUser: User = {
          ...response.data.user,
          role: roleStr.toUpperCase(),
          avatarInitials: initialsOf(response.data.user.name),
        };
        localStorage.setItem('accessToken', response.data.accessToken);
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      window.localStorage.removeItem(SESSION_KEY);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const roleKey = user ? (user.role.toUpperCase() as Role) : null;
    const permissions = roleKey && ROLE_PERMISSIONS[roleKey] ? ROLE_PERMISSIONS[roleKey] : [];
    return {
      user,
      isAuthenticated: Boolean(user),
      isReady,
      login,
      logout,
      can: (permission) => permissions.includes(permission),
      canAny: (list) => list.some((p) => permissions.includes(p)),
      roleLabel: user ? ROLE_LABELS[user.role] : "",
    };
  }, [user, isReady, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
