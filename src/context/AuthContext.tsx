import React, { createContext, useCallback, useContext, useState } from "react";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

// ─── Contexto ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(() => {
    // Cuando se integre Firebase Auth: await signInWithEmailAndPassword(...)
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    // Cuando se integre Firebase Auth: await signOut(auth)
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
