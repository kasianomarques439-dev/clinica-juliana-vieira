"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AvailableSlot, Procedure } from "@/types/database";

type AdminAppointment = {
  id: string;
  slot_id: string;
  procedure_id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  status: string;
};

type DayGroup = {
  date: string;
  slots: AvailableSlot[];
};

const DAYS_PER_PAGE = 42;

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayIso() {
  return toIsoDate(new Date());
}

function addDays(dateString: string, amount: number) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return toIsoDate(date);
}

function createLocalDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`);
}

function formatDate(dateString: string) {
  return createLocalDate(dateString).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(dateString: string) {
  return createLocalDate(dateString).toLocaleDateString("pt-BR");
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function SlotsManager() {
  const supabase = useMemo(() => createClient(), []);

  const [anchorDate, setAnchorDate] = useState(todayIso());
  const [selectedDate, setSelectedDate] = useState("");
  const [jumpDate, setJumpDate] = useState(todayIso());

  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingSlotId, setSavingSlotId] = useState<string | null>(null);
  const [savingDay, setSavingDay] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const rangeStart = anchorDate < todayIso() ? todayIso() : anchorDate;
    const rangeEnd = addDays(rangeStart, DAYS_PER_PAGE - 1);

    const [slotsResult, appointmentsResult, proceduresResult] = await Promise.all([
      supabase
        .from("available_slots")
        .select("*")
        .gte("slot_date", rangeStart)
        .lte("slot_date", rangeEnd)
        .order("slot_date", { ascending: true })
        .order("slot_time", { ascending: true })
        .limit(1000),

      supabase
        .from("appointments")
        .select("*")
        .in("status", ["confirmed", "cancelled"])
        .order("created_at", { ascending: false })
        .limit(3000),

      supabase
        .from("procedures")
        .select("*")
        .order("display_order", { ascending: true }),
    ]);

    if (slotsResult.error) {
      console.error("Erro ao carregar horários:", slotsResult.error);
      setSlots([]);
      setLoading(false);
      setError("Não foi possível carregar os horários.");
      return;
    }

    const loadedSlots = (slotsResult.data ?? []) as AvailableSlot[];
    setSlots(loadedSlots);

    if (appointmentsResult.error) {
      console.error("Erro ao carregar agendamentos:", appointmentsResult.error);
      setAppointments([]);
    } else {
      setAppointments((appointmentsResult.data ?? []) as unknown as AdminAppointment[]);
    }

    if (proceduresResult.error) {
      console.error("Erro ao carregar procedimentos:", proceduresResult.error);
      setProcedures([]);
    } else {
      setProcedures((proceduresResult.data ?? []) as Procedure[]);
    }

    if (loadedSlots.length > 0) {
      const keepCurrent = loadedSlots.some((slot) => slot.slot_date === selectedDate);
      if (!selectedDate || !keepCurrent) {
        setSelectedDate(loadedSlots[0].slot_date);
      }
    } else {
      setSelectedDate("");
    }

    setLoading(false);
  }, [anchorDate, selectedDate, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const days = useMemo<DayGroup[]>(() => {
    const grouped = new Map<string, AvailableSlot[]>();

    for (const slot of slots) {
      const current = grouped.get(slot.slot_date) ?? [];
      current.push(slot);
      grouped.set(slot.slot_date, current);
    }

    return Array.from(grouped.entries()).map(([date, daySlots]) => ({
      date,
      slots: daySlots,
    }));
  }, [slots]);

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate) ?? null,
    [days, selectedDate]
  );

  const procedureById = useMemo(
    () => new Map(procedures.map((procedure) => [procedure.id, procedure] as const)),
    [procedures]
  );

  const confirmedAppointmentBySlot = useMemo(() => {
    const map = new Map<string, AdminAppointment>();
    for (const appointment of appointments) {
      if (appointment.status === "confirmed") {
        map.set(appointment.slot_id, appointment);
      }
    }
    return map;
  }, [appointments]);

  async function toggleSlot(slot: AvailableSlot) {
    setError(null);
    setSuccess(null);

    if (slot.status === "booked") {
      setError("Este horário está ocupado. Cancele o agendamento para liberá-lo.");
      return;
    }

    setSavingSlotId(slot.id);
    const newStatus = slot.status === "blocked" ? "open" : "blocked";

    const { error: updateError } = await supabase
      .from("available_slots")
      .update({ status: newStatus })
      .eq("id", slot.id);

    setSavingSlotId(null);

    if (updateError) {
      console.error("Erro ao alterar horário:", updateError);
      setError("Não foi possível alterar este horário.");
      return;
    }

    setSuccess(
      newStatus === "blocked"
        ? `${slot.slot_time.slice(0, 5)} bloqueado com sucesso.`
        : `${slot.slot_time.slice(0, 5)} liberado com sucesso.`
    );

    await load();
  }

  async function setWholeDay(mode: "block" | "open") {
    if (!selectedDay) return;

    setError(null);
    setSuccess(null);
    setSavingDay(true);

    const ids = selectedDay.slots
      .filter((slot) => slot.status !== "booked")
      .map((slot) => slot.id);

    if (ids.length === 0) {
      setSavingDay(false);
      setError("Não há horários livres ou bloqueados para alterar neste dia.");
      return;
    }

    const newStatus = mode === "block" ? "blocked" : "open";

    const { error: updateError } = await supabase
      .from("available_slots")
      .update({ status: newStatus })
      .in("id", ids);

    setSavingDay(false);

    if (updateError) {
      console.error("Erro ao alterar dia:", updateError);
      setError("Não foi possível alterar os horários deste dia.");
      return;
    }

    setSuccess(
      mode === "block"
        ? `${formatDateShort(selectedDay.date)} foi bloqueado.`
        : `${formatDateShort(selectedDay.date)} foi liberado.`
    );

    await load();
  }

  async function cancelAppointment(
    appointment: AdminAppointment,
    slot: AvailableSlot
  ) {
    const procedure = procedureById.get(appointment.procedure_id);

    const confirmed = window.confirm(
      [
        "Cancelar este agendamento?",
        "",
        `Cliente: ${appointment.full_name}`,
        `Procedimento: ${procedure?.name ?? "Procedimento"}`,
        `Data: ${formatDateShort(slot.slot_date)}`,
        `Horário: ${slot.slot_time.slice(0, 5)}`,
        "",
        "O horário voltará a ficar disponível no site.",
      ].join("\n")
    );

    if (!confirmed) return;

    setError(null);
    setSuccess(null);
    setCancellingAppointmentId(appointment.id);

    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointment.id)
      .eq("status", "confirmed");

    setCancellingAppointmentId(null);

    if (updateError) {
      console.error("Erro ao cancelar agendamento:", updateError);
      setError("Não foi possível cancelar o agendamento.");
      return;
    }

    setSuccess(
      `Agendamento de ${appointment.full_name} cancelado. O horário voltou a ficar disponível.`
    );

    await load();
  }

  function goToDate() {
    if (!jumpDate) return;
    const target = jumpDate < todayIso() ? todayIso() : jumpDate;
    setAnchorDate(target);
    setSelectedDate(target);
    setError(null);
    setSuccess(null);
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#76509a]">
          Agenda da clínica
        </p>
        <h3 className="mt-2 font-display text-2xl text-clinic-ink md:text-3xl">
          Horários de atendimento
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-clinic-ink/60">
          Segunda a sábado, das 09:00 às 22:00. Os horários são globais para todos os procedimentos.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">● Livre</span>
        <span className="rounded-full border border-[#76509a]/20 bg-[#f4edf8] px-3 py-2 text-xs font-semibold text-[#76509a]">● Agendado</span>
        <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-500">● Bloqueado</span>
      </div>

      <div className="rounded-2xl border border-clinic-line bg-white p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <label htmlFor="jump-date" className="mb-1 block text-xs text-clinic-ink/60">
              Ir para uma data
            </label>
            <input
              id="jump-date"
              type="date"
              min={todayIso()}
              value={jumpDate}
              onChange={(event) => setJumpDate(event.target.value)}
              className="w-full rounded-xl border border-clinic-line px-4 py-2.5"
            />
          </div>

          <button
            type="button"
            onClick={goToDate}
            className="self-end rounded-xl bg-[#76509a] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Ir para data
          </button>

          <button
            type="button"
            onClick={() => {
              setAnchorDate(todayIso());
              setSelectedDate("");
              setJumpDate(todayIso());
            }}
            className="self-end rounded-xl border border-clinic-line bg-white px-5 py-2.5 text-sm font-semibold"
          >
            Hoje
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {success && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-clinic-line bg-white p-8 text-center text-sm text-clinic-ink/60">
          Carregando agenda...
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-clinic-line bg-white p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const previous = addDays(anchorDate, -DAYS_PER_PAGE);
                  setAnchorDate(previous < todayIso() ? todayIso() : previous);
                  setSelectedDate("");
                }}
                disabled={anchorDate <= todayIso()}
                className="rounded-full border border-clinic-line px-4 py-2 text-xs font-semibold disabled:opacity-40"
              >
                ← Anteriores
              </button>

              <span className="text-xs text-clinic-ink/50">6 semanas</span>

              <button
                type="button"
                onClick={() => {
                  setAnchorDate(addDays(anchorDate, DAYS_PER_PAGE));
                  setSelectedDate("");
                }}
                className="rounded-full border border-clinic-line px-4 py-2 text-xs font-semibold"
              >
                Próximas →
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {days.map((day) => {
                const selected = day.date === selectedDate;
                const booked = day.slots.filter((slot) => slot.status === "booked").length;
                const blocked = day.slots.filter((slot) => slot.status === "blocked").length;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDate(day.date)}
                    className={`min-w-[125px] rounded-2xl border px-4 py-3 text-left transition ${
                      selected
                        ? "border-[#76509a] bg-[#76509a] text-white"
                        : "border-clinic-line bg-white hover:border-[#76509a]/40"
                    }`}
                  >
                    <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-70">
                      {capitalize(
                        createLocalDate(day.date).toLocaleDateString("pt-BR", {
                          weekday: "short",
                        })
                      )}
                    </span>
                    <strong className="mt-1 block text-sm">{formatDateShort(day.date)}</strong>
                    <span className="mt-2 block text-[10px] opacity-70">
                      {booked > 0
                        ? `${booked} agendado(s)`
                        : blocked === day.slots.length
                          ? "Dia bloqueado"
                          : "Disponível"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDay && (
            <div className="rounded-[24px] border border-clinic-line bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 border-b border-clinic-line pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#76509a]">Dia selecionado</p>
                  <h4 className="mt-1 font-display text-xl text-clinic-ink sm:text-2xl">
                    {capitalize(formatDate(selectedDay.date))}
                  </h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={savingDay}
                    onClick={() => void setWholeDay("block")}
                    className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 disabled:opacity-50"
                  >
                    Bloquear dia
                  </button>
                  <button
                    type="button"
                    disabled={savingDay}
                    onClick={() => void setWholeDay("open")}
                    className="rounded-full bg-[#76509a] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Liberar dia
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {selectedDay.slots.map((slot) => {
                  const appointment = confirmedAppointmentBySlot.get(slot.id);
                  const procedure = appointment
                    ? procedureById.get(appointment.procedure_id)
                    : null;
                  const isSaving = savingSlotId === slot.id;

                  return (
                    <div
                      key={slot.id}
                      className={`rounded-2xl border p-4 ${
                        slot.status === "open"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : slot.status === "booked"
                            ? "border-[#76509a]/25 bg-[#f4edf8] text-[#56366f]"
                            : "border-gray-200 bg-gray-100 text-gray-400"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xl font-bold">{slot.slot_time.slice(0, 5)}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-70">
                            {slot.status === "open"
                              ? "Livre"
                              : slot.status === "booked"
                                ? "Agendado"
                                : "Bloqueado"}
                          </p>
                        </div>
                        <span
                          className={`mt-1 h-3 w-3 rounded-full ${
                            slot.status === "open"
                              ? "bg-emerald-500"
                              : slot.status === "booked"
                                ? "bg-[#76509a]"
                                : "bg-gray-400"
                          }`}
                        />
                      </div>

                      {slot.status === "booked" && appointment && (
                        <div className="mt-4 rounded-xl bg-white/75 p-3 text-xs leading-5">
                          <p className="font-semibold text-clinic-ink">{appointment.full_name}</p>
                          <p className="text-clinic-ink/65">{procedure?.name ?? "Procedimento"}</p>
                          <p className="text-clinic-ink/65">{appointment.phone}</p>
                          {appointment.email && (
                            <p className="break-all text-clinic-ink/65">{appointment.email}</p>
                          )}
                          <button
                            type="button"
                            disabled={cancellingAppointmentId === appointment.id}
                            onClick={() => void cancelAppointment(appointment, slot)}
                            className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-700 disabled:opacity-50"
                          >
                            {cancellingAppointmentId === appointment.id
                              ? "Cancelando..."
                              : "Cancelar agendamento"}
                          </button>
                        </div>
                      )}

                      {slot.status !== "booked" && (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => void toggleSlot(slot)}
                          className="mt-4 w-full rounded-xl border border-current bg-white px-3 py-2.5 text-xs font-semibold disabled:opacity-50"
                        >
                          {isSaving
                            ? "Salvando..."
                            : slot.status === "blocked"
                              ? "Desbloquear horário"
                              : "Bloquear horário"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="rounded-2xl border border-[#76509a]/15 bg-[#f8f3fb] p-4 text-sm leading-6 text-[#5c4968]">
        <strong>Importante:</strong> horários não são mais excluídos. Bloquear mantém o histórico. Ao cancelar um agendamento confirmado, o banco libera o horário automaticamente.
      </div>
    </div>
  );
}