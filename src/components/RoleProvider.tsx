'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  isAppRole,
  personaById,
  ROLE_STORAGE_KEY,
  type AppRole,
} from '@/lib/roles';

type RoleContextValue = {
  role: AppRole | null;
  roleLabel: string | null;
  setRole: (role: AppRole) => void;
  clearRole: () => void;
  hydrated: boolean;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AppRole | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get('role');
      const saved = localStorage.getItem(ROLE_STORAGE_KEY);
      if (isAppRole(fromQuery)) {
        setRoleState(fromQuery);
        localStorage.setItem(ROLE_STORAGE_KEY, fromQuery);
      } else if (isAppRole(saved)) {
        setRoleState(saved);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const setRole = useCallback((next: AppRole) => {
    setRoleState(next);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const clearRole = useCallback(() => {
    setRoleState(null);
    try {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      role,
      roleLabel: personaById(role)?.title ?? null,
      setRole,
      clearRole,
      hydrated,
    }),
    [role, setRole, clearRole, hydrated]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
