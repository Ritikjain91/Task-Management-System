'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, clearToken, getToken, setToken } from './api';
import type { User, Workspace } from './types';

const ACTIVE_WORKSPACE_KEY = 'pyramid_active_workspace';

interface AuthContextValue {
  user: User | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  loginAsGuest: (name?: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  setActiveWorkspaceId: (id: string) => void;
  refreshWorkspaces: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshWorkspaces = useCallback(async () => {
    const list = await api.listWorkspaces();
    setWorkspaces(list);
    const stored =
      typeof window !== 'undefined' ? window.localStorage.getItem(ACTIVE_WORKSPACE_KEY) : null;
    const stillValid = stored && list.some((w) => w.id === stored);
    const nextId = stillValid ? stored : list[0]?.id ?? null;
    setActiveWorkspaceIdState(nextId);
    if (nextId && typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, nextId);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const me = await api.me();
        setUser(me);
        await refreshWorkspaces();
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshWorkspaces]);

  const loginAsGuest = useCallback(
    async (name?: string) => {
      const { token, user: newUser, workspaceId } = await api.loginGuest(name);
      setToken(token);
      setUser(newUser);
      window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
      await refreshWorkspaces();
      router.push('/tasks');
    },
    [refreshWorkspaces, router],
  );

  const loginWithToken = useCallback(
    async (token: string) => {
      setToken(token);
      const me = await api.me();
      setUser(me);
      await refreshWorkspaces();
      router.push('/tasks');
    },
    [refreshWorkspaces, router],
  );

  const logout = useCallback(() => {
    clearToken();
    window.localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspaceIdState(null);
    router.push('/login');
  }, [router]);

  const setActiveWorkspaceId = useCallback((id: string) => {
    setActiveWorkspaceIdState(id);
    window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await api.me();
    setUser(me);
  }, []);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspace,
        loading,
        loginAsGuest,
        loginWithToken,
        logout,
        setActiveWorkspaceId,
        refreshWorkspaces,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
