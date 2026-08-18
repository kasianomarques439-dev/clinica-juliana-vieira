"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  AvailableSlot,
  Procedure,
} from "@/types/database";

export default function SlotsManager() {
  const supabase = useMemo(() => createClient(), []);

  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [evaluation, setEvaluation] =
    useState<Procedure | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [intervalMin, setIntervalMin] = useState(60);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    /*
     * Busca o procedimento Avaliação.
     */
    const {
      data: evaluationData,
      error: evaluationError,
    } = await supabase
      .from("procedures")
      .select("*")
      .ilike("name", "Avaliação")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (evaluationError || !evaluationData) {
      console.error(
        "Erro ao localizar avaliação:",
        evaluationError
      );

      setEvaluation(null);
      setSlots([]);
      setLoading(false);

      setError(
        'Não foi possível localizar o procedimento "Avaliação".'
      );

      return;
    }

    const evaluationProcedure =
      evaluationData as Procedure;

    setEvaluation(evaluationProcedure);

    /*
     * Lista somente os horários da Avaliação.
     */
    const today = new Date().toISOString().slice(0, 10);

    const {
      data: slotsData,
      error: slotsError,
    } = await supabase
      .from("available_slots")
      .select("*")
      .eq(
        "procedure_id",
        evaluationProcedure.id
      )
      .gte("slot_date", today)
      .order("slot_date", { ascending: true })
      .order("slot_time", { ascending: true });

    if (slotsError) {
      console.error(
        "Erro ao carregar horários:",
        slotsError
      );

      setSlots([]);
      setError(
        "Não foi possível carregar os horários."
      );
    } else {
      setSlots(
        (slotsData ?? []) as AvailableSlot[]
      );
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleGenerate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (!evaluation) {
      setError(
        'O procedimento "Avaliação" não foi encontrado.'
      );
      return;
    }

    if (!date) {
      setError("Escolha uma data.");
      return;
    }

    if (!startTime || !endTime) {
      setError(
        "Informe o horário inicial e final."
      );
      return;
    }

    if (intervalMin < 5) {
      setError(
        "O intervalo deve ser de pelo menos 5 minutos."
      );
      return;
    }

    const [startHour, startMinute] =
      startTime.split(":").map(Number);

    const [endHour, endMinute] =
      endTime.split(":").map(Number);

    const startTotal =
      startHour * 60 + startMinute;

    const endTotal =
      endHour * 60 + endMinute;

    if (endTotal <= startTotal) {
      setError(
        "O horário final deve ser depois do horário inicial."
      );
      return;
    }

    setSaving(true);

    const rows: Array<{
      procedure_id: string;
      slot_date: string;
      slot_time: string;
      status: string;
    }> = [];

    for (
      let current = startTotal;
      current < endTotal;
      current += intervalMin
    ) {
      const hour = Math.floor(current / 60);
      const minute = current % 60;

      const formattedTime =
        `${String(hour).padStart(2, "0")}:` +
        `${String(minute).padStart(2, "0")}:00`;

      rows.push({
        procedure_id: evaluation.id,
        slot_date: date,
        slot_time: formattedTime,
        status: "open",
      });
    }

    if (rows.length === 0) {
      setSaving(false);
      setError(
        "Nenhum horário pôde ser gerado."
      );
      return;
    }

    /*
     * O banco possui UNIQUE em:
     *
     * procedure_id + slot_date + slot_time
     *
     * Portanto usamos exatamente essas
     * três colunas no onConflict.
     */
    const { error: insertError } =
      await supabase
        .from("available_slots")
        .upsert(rows, {
          onConflict:
            "procedure_id,slot_date,slot_time",
          ignoreDuplicates: true,
        });

    setSaving(false);

    if (insertError) {
      console.error(
        "Erro ao criar horários:",
        insertError
      );

      setError(
        `Não foi possível criar os horários: ${insertError.message}`
      );

      return;
    }

    setSuccess(
      `${rows.length} horário(s) processado(s) com sucesso.`
    );

    await load();
  }

  async function toggleBlock(
    slot: AvailableSlot
  ) {
    setError(null);
    setSuccess(null);

    if (slot.status === "booked") {
      setError(
        "Um horário ocupado não pode ser bloqueado."
      );
      return;
    }

    const newStatus =
      slot.status === "blocked"
        ? "open"
        : "blocked";

    const { error: updateError } =
      await supabase
        .from("available_slots")
        .update({
          status: newStatus,
        })
        .eq("id", slot.id);

    if (updateError) {
      console.error(
        "Erro ao alterar horário:",
        updateError
      );

      setError(
        "Não foi possível alterar o horário."
      );

      return;
    }

    await load();
  }

  async function remove(
    slot: AvailableSlot
  ) {
    setError(null);
    setSuccess(null);

    if (slot.status === "booked") {
      window.alert(
        "Este horário possui um agendamento e não pode ser removido."
      );

      return;
    }

    const confirmed = window.confirm(
      `Deseja excluir o horário ${slot.slot_time.slice(
        0,
        5
      )}?`
    );

    if (!confirmed) {
      return;
    }

    const { error: deleteError } =
      await supabase
        .from("available_slots")
        .delete()
        .eq("id", slot.id);

    if (deleteError) {
      console.error(
        "Erro ao excluir horário:",
        deleteError
      );

      setError(
        "Não foi possível excluir o horário."
      );

      return;
    }

    await load();
  }

  function getStatusLabel(status: string) {
    if (status === "open") {
      return "Livre";
    }

    if (status === "booked") {
      return "Ocupado";
    }

    if (status === "blocked") {
      return "Bloqueado";
    }

    return status;
  }

  function getStatusClass(status: string) {
    if (status === "open") {
      return "text-clinic-sage-dark";
    }

    if (status === "booked") {
      return "text-clinic-clay";
    }

    return "text-clinic-ink/40";
  }

  const today =
    new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* GERAR HORÁRIOS */}

      <div>
        <h3 className="mb-1 font-display text-lg">
          Gerar horários
        </h3>

        <p className="mb-5 text-sm text-clinic-ink/60">
          Os horários criados aqui serão usados para
          agendamentos de novos clientes.
        </p>

        {evaluation && (
          <div className="mb-5 rounded-clinic border border-clinic-line bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-clinic-ink/50">
              Procedimento
            </p>

            <p className="mt-1 font-semibold text-clinic-sage-dark">
              {evaluation.name}
            </p>
          </div>
        )}

        <form
          onSubmit={handleGenerate}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="slot-date"
              className="mb-1 block text-xs text-clinic-ink/60"
            >
              Data
            </label>

            <input
              id="slot-date"
              type="date"
              min={today}
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              className="w-full rounded-clinic border border-clinic-line px-4 py-2.5"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="start-time"
                className="mb-1 block text-xs text-clinic-ink/60"
              >
                Início
              </label>

              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(event) =>
                  setStartTime(
                    event.target.value
                  )
                }
                className="w-full rounded-clinic border border-clinic-line px-4 py-2.5"
              />
            </div>

            <div>
              <label
                htmlFor="end-time"
                className="mb-1 block text-xs text-clinic-ink/60"
              >
                Fim
              </label>

              <input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(event) =>
                  setEndTime(
                    event.target.value
                  )
                }
                className="w-full rounded-clinic border border-clinic-line px-4 py-2.5"
              />
            </div>

            <div>
              <label
                htmlFor="interval"
                className="mb-1 block text-xs text-clinic-ink/60"
              >
                Intervalo (min)
              </label>

              <input
                id="interval"
                type="number"
                min={5}
                step={5}
                value={intervalMin}
                onChange={(event) =>
                  setIntervalMin(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-clinic border border-clinic-line px-4 py-2.5"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-clinic border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-clinic border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={
              saving ||
              !evaluation
            }
            className="rounded-clinic bg-clinic-sage-dark px-5 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Gerando..."
              : "Gerar horários"}
          </button>
        </form>
      </div>

      {/* PRÓXIMOS HORÁRIOS */}

      <div>
        <h3 className="mb-4 font-display text-lg">
          Próximos horários
        </h3>

        {loading && (
          <p className="text-sm text-clinic-ink/60">
            Carregando...
          </p>
        )}

        {!loading &&
          slots.length === 0 && (
            <p className="text-sm text-clinic-ink/60">
              Nenhum horário criado.
            </p>
          )}

        <ul className="max-h-[520px] space-y-2 overflow-y-auto">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="flex flex-col gap-3 rounded-clinic border border-clinic-line bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span>
                {new Date(
                  `${slot.slot_date}T00:00:00`
                ).toLocaleDateString(
                  "pt-BR"
                )}

                {" · "}

                {slot.slot_time.slice(0, 5)}

                {" · "}

                <span
                  className={getStatusClass(
                    slot.status
                  )}
                >
                  {getStatusLabel(
                    slot.status
                  )}
                </span>
              </span>

              <div className="flex shrink-0 gap-3 text-xs">
                {slot.status !==
                  "booked" && (
                  <button
                    type="button"
                    onClick={() => {
                      void toggleBlock(
                        slot
                      );
                    }}
                    className="text-clinic-sage-dark underline"
                  >
                    {slot.status ===
                    "blocked"
                      ? "Desbloquear"
                      : "Bloquear"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    void remove(slot);
                  }}
                  className="text-red-600 underline"
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