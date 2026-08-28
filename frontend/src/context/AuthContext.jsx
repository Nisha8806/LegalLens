import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// -----------------------------------------------------------------------
// LegalLens Auth
// -----------------------------------------------------------------------
// The rest of the app (services/api.js) is intentionally backend-less —
// every request resolves local sample data. There is no live LegalLens
// auth API to plug into yet, so this context provides the minimum real
// auth structure the UI needs (sign up, log in, log out, session
// persistence, protected routes) using localStorage as the store.
//
// Swapping this for a real backend later only means rewriting the four
// functions below (register/login/logout/refresh) — every component
// only ever talks to `useAuth()`, never to localStorage directly.
// -----------------------------------------------------------------------

const USERS_KEY = "legallens.users";
const SESSION_KEY = "legallens.session";

const AuthContext = createContext(null);

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Not cryptographic — this is a frontend-only demo store, not a real
// credential vault. Swap for real backend auth before handling real data.
async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const persisted = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (persisted) {
      try {
        setUser(JSON.parse(persisted));
      } catch {
        /* corrupt session, ignore */
      }
    }
    setInitializing(false);
  }, []);

  const persistSession = useCallback((sessionUser, remember) => {
    const payload = JSON.stringify(sessionUser);
    if (remember) {
      localStorage.setItem(SESSION_KEY, payload);
    } else {
      sessionStorage.setItem(SESSION_KEY, payload);
    }
  }, []);

  const register = useCallback(async ({ name, firm, email, password }) => {
    await delay(600);
    const users = readUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email === normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      firm: firm?.trim() || "",
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    writeUsers([...users, newUser]);

    const sessionUser = { id: newUser.id, name: newUser.name, firm: newUser.firm, email: newUser.email };
    setUser(sessionUser);
    persistSession(sessionUser, true);
    return sessionUser;
  }, [persistSession]);

  const login = useCallback(async ({ email, password, remember }) => {
    await delay(600);
    const normalizedEmail = email.trim().toLowerCase();
    const users = readUsers();
    const passwordHash = await hashPassword(password);
    const match = users.find((u) => u.email === normalizedEmail && u.passwordHash === passwordHash);

    if (!match) {
      throw new Error("Invalid email or password.");
    }

    const sessionUser = { id: match.id, name: match.name, firm: match.firm, email: match.email };
    setUser(sessionUser);
    persistSession(sessionUser, remember);
    return sessionUser;
  }, [persistSession]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, initializing, register, login, logout }),
    [user, initializing, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
