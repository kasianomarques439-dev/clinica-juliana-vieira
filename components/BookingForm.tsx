"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Procedure, AvailableSlot } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { maskCpf, maskPhone, isValidCpf, isValidPhone } from "@/lib/utils";

type Step = "procedure" | "slot" | "data" | "success";

export default function BookingForm({
  procedures,
}: {
  procedures: Procedure[];
}) {
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<Step>("procedure");
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [consent, setConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // busca horarios abertos assim que um procedimento e escolhido
  useEffect(() => {
    if (!procedure) return;
    setLoadingSlots(true);
    setError(null);

    supabase
      .from("available_slots")
      .select("*")
      .eq("status", "open")
      .gte("slot_date", new Date().toISOString().slice(0, 10))
      .order("slot_date", { ascending: true })
      .order("slot_time", { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError("Nao foi possivel carregar os horarios. Tente novamente.");
        } else {
          setSlots(data ?? []);
        }
        setLoadingSlots(false);
      });
  }, [procedure, supabase]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, AvailableSlot[]>();
    for (const slot of slots) {
      const list = map.get(slot.slot_date) ?? [];
      list.push(slot);
      map.set(slot.slot_date, list);
    }
    return map;
  }, [slots]);

  const availableDates = Array.from(slotsByDate.keys());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!procedure || !selectedSlot) return;
    if (!fullName.trim()) return setError("Informe seu nome completo.");
    if (!isValidPhone(phone)) return setError("Informe um celular valido.");
    if (!isValidCpf(cpf)) return setError("Informe um CPF valido.");
    if (!consent)
      return setError(
        "E preciso concordar com o uso dos dados (LGPD) para agendar."
      );

    setSubmitting(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          procedureId: procedure.id,
          fullName: fullName.trim(),
          phone,
          cpf,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(
            "Esse horario acabou de ser reservado por outra pessoa. Escolha outro horario."
          );
          setStep("slot");
          setSelectedSlot(null);
          // remove o slot da lista local
          setSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id));
        } else {
          setError(result.error ?? "Nao foi possivel confirmar o agendamento.");
        }
        return;
      }

      setStep("success");
    } catch {
      setError("Erro de conexao. Verifique sua internet e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="agendar" className="bg-clinic-sage/5 py-20 md:py-28">
      <div className="container-clinic max-w-2xl">
        <p className="text-clinic-sage-dark text-sm tracking-[0.2em] uppercase mb-3">
          Agendamento
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-clinic-ink mb-10">
          Agende sua avaliacao
        </h2>

        {step === "procedure" && (
          <div>
            <p className="mb-4 text-clinic-ink/70">
              Escolha o procedimento desejado:
            </p>
            <div className="grid gap-3">
              {procedures.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProcedure(p);
                    setStep("slot");
                  }}
                  className="rounded-clinic border border-clinic-line bg-white p-4 text-left hover:border-clinic-sage transition-colors"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="block text-sm text-clinic-ink/60">
                    {p.duration_minutes} min
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "slot" && procedure && (
          <div>
            <button
              type="button"
              onClick={() => setStep("procedure")}
              className="mb-4 text-sm text-clinic-sage-dark underline"
            >
              &larr; Trocar procedimento
            </button>
            <p className="mb-4 text-clinic-ink/70">
              Procedimento: <strong>{procedure.name}</strong>. Escolha uma
              data e horario:
            </p>

            {loadingSlots && <p>Carregando horarios...</p>}

            {!loadingSlots && availableDates.length === 0 && (
              <p className="text-clinic-ink/60">
                Nenhum horario disponivel no momento. Entre em contato pelo
                Instagram para verificar novas datas.
              </p>
            )}

            {!loadingSlots && availableDates.length > 0 && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`rounded-clinic border px-4 py-2 text-sm ${
                        selectedDate === date
                          ? "border-clinic-sage bg-clinic-sage text-white"
                          : "border-clinic-line bg-white"
                      }`}
                    >
                      {new Date(date + "T00:00:00").toLocaleDateString(
                        "pt-BR",
                        { weekday: "short", day: "2-digit", month: "2-digit" }
                      )}
                    </button>
                  ))}
                </div>

                {selectedDate && (
                  <div className="flex flex-wrap gap-2">
                    {(slotsByDate.get(selectedDate) ?? []).map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          setStep("data");
                        }}
                        className="rounded-clinic border border-clinic-line bg-white px-4 py-2 text-sm hover:border-clinic-sage"
                      >
                        {slot.slot_time.slice(0, 5)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === "data" && procedure && selectedSlot && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <button
              type="button"
              onClick={() => setStep("slot")}
              className="text-sm text-clinic-sage-dark underline"
            >
              &larr; Trocar horario
            </button>

            <div className="rounded-clinic border border-clinic-line bg-white p-4 text-sm">
              <strong>{procedure.name}</strong> em{" "}
              {new Date(
                selectedSlot.slot_date + "T00:00:00"
              ).toLocaleDateString("pt-BR")}{" "}
              as {selectedSlot.slot_time.slice(0, 5)}
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="fullName">
                Nome completo
              </label>
              <input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-clinic border border-clinic-line px-4 py-2.5 outline-none focus:border-clinic-sage"
              />
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="phone">
                Celular
              </label>
              <input
                id="phone"
                required
                inputMode="numeric"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                className="w-full rounded-clinic border border-clinic-line px-4 py-2.5 outline-none focus:border-clinic-sage"
              />
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="cpf">
                CPF
              </label>
              <input
                id="cpf"
                required
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
                className="w-full rounded-clinic border border-clinic-line px-4 py-2.5 outline-none focus:border-clinic-sage"
              />
            </div>

            <label
              htmlFor="lgpd"
              className="flex items-start gap-3 text-sm text-clinic-ink/70"
            >
              <input
                id="lgpd"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              Concordo com o uso dos meus dados pessoais (nome, celular e
              CPF) exclusivamente para a confirmacao e gestao deste
              agendamento, conforme a Lei Geral de Protecao de Dados (LGPD).
            </label>

            {error && (
              <p className="rounded-clinic bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-clinic bg-clinic-clay px-6 py-3 text-white text-sm disabled:opacity-60"
            >
              {submitting ? "Confirmando..." : "Confirmar agendamento"}
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="rounded-clinic border border-clinic-sage bg-white p-6">
            <h3 className="font-display text-xl text-clinic-ink mb-2">
              Agendamento confirmado!
            </h3>
            <p className="text-clinic-ink/70 text-sm">
              Voce recebera a confirmacao em breve pelo celular informado.
              Nos vemos em breve!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
