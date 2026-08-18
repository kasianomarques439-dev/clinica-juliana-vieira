"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AvailableSlot } from "@/types/database";

export default function SlotsManager() {
  const supabase = createClient();
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [intervalMin, setIntervalMin] = useState(60);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("available_slots")
      .select("*")
      .gte("slot_date", new Date().toISOString().slice(0, 10))
      .order("slot_date", { ascending: true })
      .order("slot_time", { ascending: true });
    setSlots(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // gera varios horarios de uma vez para o dia escolhido (ex.: 09:00 as
  // 17:00 de 60 em 60 minutos)
  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!date) return setError("Escolha uma data.");
    setSaving(true);

    const rows: { slot_date: string; slot_time: string; status: "open" }[] = [];
    let [h, m] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    while (h < endH || (h === endH && m < endM)) {
      rows.push({
        slot_date: date,
        slot_time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`,
        status: "open",
      });
      m += intervalMin;
      while (m >= 60) {
        m -= 60;
        h += 1;
      }
    }

    const { error: insertError } = await supabase
      .from("available_slots")
      .upsert(rows, { onConflict: "slot_date,slot_time", ignoreDuplicates: true });

    setSaving(false);

    if (insertError) {
      setError("Nao foi possivel criar os horarios.");
      return;
    }

    load();
  }

  async function toggleBlock(slot: AvailableSlot) {
    const newStatus = slot.status === "blocked" ? "open" : "blocked";
    await supabase
      .from("available_slots")
      .update({ status: newStatus })
      .eq("id", slot.id);
    load();
  }

  async function remove(slot: AvailableSlot) {
    if (slot.status === "booked") {
      alert("Este horario ja possui um agendamento e nao pode ser removido.");
      return;
    }
    await supabase.from("available_slots").delete().eq("id", slot.id);
    load();
  }

  const statusLabel: Record<AvailableSlot["status"], string> = {
    open: "Livre",
    booked: "Ocupado",
    blocked: "Bloqueado",
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="font-display text-lg mb-4">Gerar horarios</h3>
        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <label className="block text-xs text-clinic-ink/60 mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-clinic border border-clinic-line px-4 py-2.5"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-clinic-ink/60 mb-1">
                Inicio
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-clinic border border-clinic-line px-4 py-2.5"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-clinic-ink/60 mb-1">Fim</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-clinic border border-clinic-line px-4 py-2.5"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-clinic-ink/60 mb-1">
                Intervalo (min)
              </label>
              <input
                type="number"
                min={5}
                value={intervalMin}
                onChange={(e) => setIntervalMin(Number(e.target.value))}
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
            {saving ? "Gerando..." : "Gerar horarios"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-display text-lg mb-4">Proximos horarios</h3>
        {loading && <p className="text-sm text-clinic-ink/60">Carregando...</p>}
        <ul className="space-y-2 max-h-96 overflow-y-auto">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="rounded-clinic border border-clinic-line bg-white p-3 flex items-center justify-between text-sm"
            >
              <span>
                {new Date(slot.slot_date + "T00:00:00").toLocaleDateString(
                  "pt-BR"
                )}{" "}
                &middot; {slot.slot_time.slice(0, 5)} &middot;{" "}
                <span
                  className={
                    slot.status === "open"
                      ? "text-clinic-sage-dark"
                      : slot.status === "booked"
                      ? "text-clinic-clay"
                      : "text-clinic-ink/40"
                  }
                >
                  {statusLabel[slot.status]}
                </span>
              </span>
              <div className="flex gap-3 text-xs shrink-0">
                {slot.status !== "booked" && (
                  <button
                    onClick={() => toggleBlock(slot)}
                    className="underline text-clinic-sage-dark"
                  >
                    {slot.status === "blocked" ? "Desbloquear" : "Bloquear"}
                  </button>
                )}
                <button
                  onClick={() => remove(slot)}
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
