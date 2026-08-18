"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Procedure } from "@/types/database";
import { formatPriceCents } from "@/lib/utils";

export default function ProceduresManager() {
  const supabase = createClient();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [priceReais, setPriceReais] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("procedures")
      .select("*")
      .order("created_at", { ascending: false });
    setProcedures(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Informe o nome do procedimento.");
    setSaving(true);

    const priceCents = priceReais
      ? Math.round(parseFloat(priceReais.replace(",", ".")) * 100)
      : null;

    const { error: insertError } = await supabase.from("procedures").insert({
      name: name.trim(),
      description: description.trim(),
      duration_minutes: duration,
      price_cents: priceCents,
      is_active: true,
    });

    setSaving(false);

    if (insertError) {
      setError("Nao foi possivel salvar. Tente novamente.");
      return;
    }

    setName("");
    setDescription("");
    setDuration(60);
    setPriceReais("");
    load();
  }

  async function toggleActive(procedure: Procedure) {
    await supabase
      .from("procedures")
      .update({ is_active: !procedure.is_active })
      .eq("id", procedure.id);
    load();
  }

  async function remove(procedure: Procedure) {
    if (!confirm(`Remover "${procedure.name}"?`)) return;
    await supabase.from("procedures").delete().eq("id", procedure.id);
    load();
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="font-display text-lg mb-4">Novo procedimento</h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-clinic border border-clinic-line px-4 py-2.5"
          />
          <textarea
            placeholder="Descricao"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-clinic border border-clinic-line px-4 py-2.5"
            rows={3}
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-clinic-ink/60 mb-1">
                Duracao (min)
              </label>
              <input
                type="number"
                min={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-clinic border border-clinic-line px-4 py-2.5"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-clinic-ink/60 mb-1">
                Preco (R$, opcional)
              </label>
              <input
                placeholder="180,00"
                value={priceReais}
                onChange={(e) => setPriceReais(e.target.value)}
                className="w-full rounded-clinic border border-clinic-line px-4 py-2.5"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-clinic bg-clinic-sage-dark px-5 py-2.5 text-white text-sm disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Adicionar procedimento"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-display text-lg mb-4">Procedimentos cadastrados</h3>
        {loading && <p className="text-sm text-clinic-ink/60">Carregando...</p>}
        <ul className="space-y-3">
          {procedures.map((p) => (
            <li
              key={p.id}
              className="rounded-clinic border border-clinic-line bg-white p-4 flex items-start justify-between gap-3"
            >
              <div>
                <p className="font-medium">
                  {p.name}{" "}
                  {!p.is_active && (
                    <span className="text-xs text-clinic-ink/40">
                      (inativo)
                    </span>
                  )}
                </p>
                <p className="text-xs text-clinic-ink/60">
                  {p.duration_minutes} min &middot;{" "}
                  {formatPriceCents(p.price_cents)}
                </p>
              </div>
              <div className="flex gap-3 text-xs shrink-0">
                <button
                  onClick={() => toggleActive(p)}
                  className="underline text-clinic-sage-dark"
                >
                  {p.is_active ? "Desativar" : "Ativar"}
                </button>
                <button
                  onClick={() => remove(p)}
                  className="underline text-red-600"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
