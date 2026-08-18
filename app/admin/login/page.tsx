"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("E-mail ou senha invalidos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-clinic-bg px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-clinic border border-clinic-line bg-white p-8"
      >
        <h1 className="font-display text-2xl text-clinic-ink mb-1">
          Painel administrativo
        </h1>
        <p className="text-sm text-clinic-ink/60 mb-6">
          Acesso restrito a Juliana Vieira.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-clinic border border-clinic-line px-4 py-2.5 outline-none focus:border-clinic-sage"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-clinic border border-clinic-line px-4 py-2.5 outline-none focus:border-clinic-sage"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-clinic bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-clinic bg-clinic-ink px-6 py-3 text-white text-sm disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
