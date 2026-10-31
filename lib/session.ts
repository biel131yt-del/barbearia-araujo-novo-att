"use client";

import { useEffect, useState } from "react";

let currentUser: { id: number; name: string; email: string; role: string } | null = null;

export function useSession() {
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/admin/login";
  };

  return { user, loading, logout };
}

export function requireSession(user: any) {
  if (!user) throw new Error("Sessão não encontrada");
  return user;
}
