"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type {
  AvailableSlot,
  Procedure,
} from "@/types/database";
import {
  isValidPhone,
  maskPhone,
} from "@/lib/utils";

type Step = "slot" | "data" | "success";

type AppointmentApiResponse = {
  id?: string;
  error?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  );
}

function formatDateLong(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getWeekday(date: string) {
  return new Date(
    `${date}T00:00:00`
  )
    .toLocaleDateString("pt-BR", {
      weekday: "short",
    })
    .replace(".", "");
}

function getDayNumber(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("pt-BR", {
    day: "2-digit",
  });
}

function getMonth(date: string) {
  return new Date(
    `${date}T00:00:00`
  )
    .toLocaleDateString("pt-BR", {
      month: "short",
    })
    .replace(".", "");
}

function formatDateToIso(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayIso() {
  return formatDateToIso(
    new Date()
  );
}

function getBookingWindowEnd(
  dateString: string
) {
  const date = new Date(
    `${dateString}T12:00:00`
  );

  date.setDate(
    date.getDate() + 13
  );

  return formatDateToIso(date);
}

function getBookingDates(
  dateString: string
) {
  const start = new Date(
    `${dateString}T12:00:00`
  );

  return Array.from(
    { length: 14 },
    (_item, index) => {
      const date = new Date(start);

      date.setDate(
        start.getDate() + index
      );

      return formatDateToIso(date);
    }
  );
}

function isSunday(dateString: string) {
  return (
    new Date(
      `${dateString}T12:00:00`
    ).getDay() === 0
  );
}

export default function BookingForm() {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [step, setStep] =
    useState<Step>("slot");

  const [procedure, setProcedure] =
    useState<Procedure | null>(null);

  const [slots, setSlots] =
    useState<AvailableSlot[]>([]);

  const [loadingSlots, setLoadingSlots] =
    useState(true);

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [selectedSlot, setSelectedSlot] =
    useState<AvailableSlot | null>(null);

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [consent, setConsent] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * QUANDO A PÁGINA ABRE:
   * usa Avaliação como procedimento padrão.
   */
  useEffect(() => {
    let active = true;

    async function loadDefaultProcedure() {
      const result = await supabase
        .from("procedures")
        .select("*")
        .ilike("name", "Avaliação")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (result.error) {
        console.error(
          "Erro ao carregar avaliação:",
          result.error
        );

        return;
      }

      if (
        result.data &&
        !procedure
      ) {
        setProcedure(result.data);
      }
    }

    void loadDefaultProcedure();

    return () => {
      active = false;
    };
  }, [supabase, procedure]);

  /*
   * ESCUTA O PROCEDIMENTO CLICADO
   * NO ProcedureCard.tsx
   */
  useEffect(() => {
    function handleProcedureSelection(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<Procedure>;

      const selectedProcedure =
        customEvent.detail;

      if (!selectedProcedure) {
        return;
      }

      setProcedure(selectedProcedure);

      setSelectedDate(null);
      setSelectedSlot(null);

      setSlots([]);

      setStep("slot");

      setError(null);
    }

    window.addEventListener(
      "select-procedure-for-booking",
      handleProcedureSelection
    );

    return () => {
      window.removeEventListener(
        "select-procedure-for-booking",
        handleProcedureSelection
      );
    };
  }, []);

  /*
   * CARREGA TODOS OS HORÁRIOS GLOBAIS DA CLÍNICA.
   *
   * Esta função é reutilizada:
   * - quando o procedimento muda;
   * - quando a aba volta a ficar visível;
   * - automaticamente a cada poucos segundos.
   *
   * Assim, se outra pessoa reservar um horário em outro
   * celular/computador, ele desaparece também desta tela.
   */
  const loadSlots = useCallback(
    async (
      showLoading = true
    ) => {
      if (!procedure) {
        setSlots([]);
        setLoadingSlots(false);
        return;
      }

      if (showLoading) {
        setLoadingSlots(true);
      }

      setError(null);

      const today =
        getTodayIso();

      const bookingWindowEnd =
        getBookingWindowEnd(today);

      const result = await supabase
        .from("available_slots")
        .select("*")
        .gte("slot_date", today)
        .lte("slot_date", bookingWindowEnd)
        .order("slot_date", {
          ascending: true,
        })
        .order("slot_time", {
          ascending: true,
        });

      if (result.error) {
        console.error(
          "Erro ao carregar horários:",
          result.error
        );

        setSlots([]);

        setError(
          "Não foi possível carregar os horários disponíveis."
        );
      } else {
        const newSlots =
          result.data ?? [];

        setSlots(newSlots);

        if (selectedSlot) {
          const stillAvailable =
            newSlots.some(
              (slot) =>
                slot.id ===
                  selectedSlot.id &&
                slot.status ===
                  "open"
            );

          if (!stillAvailable) {
            setSelectedSlot(null);
            setSelectedDate(null);
            setStep("slot");
            setError(
              "Este horário acabou de ser reservado. Escolha outro horário."
            );
          }
        }
      }

      if (showLoading) {
        setLoadingSlots(false);
      }
    },
    [
      procedure,
      selectedSlot,
      supabase,
    ]
  );

  useEffect(() => {
    void loadSlots(true);
  }, [loadSlots]);

  useEffect(() => {
    if (!procedure) {
      return;
    }

    const interval =
      window.setInterval(() => {
        void loadSlots(false);
      }, 5000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [procedure, loadSlots]);

  useEffect(() => {
    if (!procedure) {
      return;
    }

    function refreshWhenVisible() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        void loadSlots(false);
      }
    }

    function refreshOnFocus() {
      void loadSlots(false);
    }

    document.addEventListener(
      "visibilitychange",
      refreshWhenVisible
    );

    window.addEventListener(
      "focus",
      refreshOnFocus
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        refreshWhenVisible
      );

      window.removeEventListener(
        "focus",
        refreshOnFocus
      );
    };
  }, [procedure, loadSlots]);

  const slotsByDate = useMemo(() => {
    const grouped = new Map<
      string,
      AvailableSlot[]
    >();

    for (const slot of slots) {
      const current =
        grouped.get(slot.slot_date) ?? [];

      current.push(slot);

      grouped.set(
        slot.slot_date,
        current
      );
    }

    return grouped;
  }, [slots]);

  const bookingDates = useMemo(
    () =>
      getBookingDates(
        getTodayIso()
      ),
    []
  );

  function selectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setError(null);
  }

  function selectSlot(
    slot: AvailableSlot
  ) {
    setSelectedSlot(slot);
    setStep("data");
    setError(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (!procedure) {
      setError(
        "Selecione um procedimento."
      );
      return;
    }

    if (!selectedSlot) {
      setError(
        "Escolha uma data e um horário."
      );
      return;
    }

    const normalizedName =
      fullName.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (
      normalizedName.length < 3
    ) {
      setError(
        "Informe seu nome completo."
      );
      return;
    }

    if (!isValidPhone(phone)) {
      setError(
        "Informe um celular válido."
      );
      return;
    }

    if (
      !isValidEmail(
        normalizedEmail
      )
    ) {
      setError(
        "Informe um e-mail válido."
      );
      return;
    }

    if (!consent) {
      setError(
        "É necessário concordar com o uso dos dados para realizar o agendamento."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/appointments",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            slotId: selectedSlot.id,
            procedureId:
              procedure.id,
            fullName:
              normalizedName,
            phone,
            email:
              normalizedEmail,
          }),
        }
      );

      const result =
        (await response
          .json()
          .catch(
            () => ({})
          )) as AppointmentApiResponse;

      if (!response.ok) {
        if (
          response.status === 409
        ) {
          setError(
            result.error ??
              "Esse horário não está mais disponível. Escolha outro horário."
          );

          setSlots((current) =>
            current.map(
              (slot) =>
                slot.id ===
                selectedSlot.id
                  ? {
                      ...slot,
                      status:
                        "booked",
                    }
                  : slot
            )
          );

          setSelectedDate(null);
          setSelectedSlot(null);
          setStep("slot");

          return;
        }

        if (
          response.status === 400 ||
          response.status === 404
        ) {
          setError(
            result.error ??
              "Confira os dados e tente novamente."
          );

          return;
        }

        setError(
          result.error ??
            "Não foi possível confirmar o agendamento. Tente novamente."
        );

        return;
      }

      setSlots((current) =>
        current.map(
          (slot) =>
            slot.id ===
            selectedSlot.id
              ? {
                  ...slot,
                  status:
                    "booked",
                }
              : slot
        )
      );

      setStep("success");
    } catch (requestError) {
      console.error(
        "Erro ao enviar agendamento:",
        requestError
      );

      setError(
        "Erro de conexão. Verifique sua internet e tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setStep("slot");

    setSelectedDate(null);
    setSelectedSlot(null);

    setFullName("");
    setPhone("");
    setEmail("");

    setConsent(false);

    setError(null);
  }

  return (
    <section
      id="agendar"
      className="
        relative
        overflow-hidden
        bg-gradient-to-br
        from-[#684083]
        via-[#76509a]
        to-[#56366f]
        py-20
        md:py-28
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
        "
        style={{
          backgroundImage: `
            radial-gradient(
              circle at 10% 20%,
              rgba(118,80,154,0.06),
              transparent 25%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(135,90,61,0.05),
              transparent 25%
            )
          `,
        }}
      />

      <div
        className="
          relative
          mx-auto
          w-full
          max-w-6xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* CABEÇALHO */}
        <div
          className="
            mx-auto
            mb-10
            max-w-3xl
            text-center
            md:mb-14
          "
        >
          <p
            className="
              mb-3
              text-xs
              font-semibold
              uppercase
              tracking-[0.28em]
              text-[#76509a]
            "
          >
            <span className="text-[#ead9b6]">
              Agendamento
            </span>
          </p>

          <h2
            className="
              font-display
              text-4xl
              leading-tight
              text-white
              md:text-5xl
            "
          >
            Agende seu horário
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-7
              text-white/80
              md:text-base
            "
          >
            Escolha entre os próximos 14 dias
            e veja os horários disponíveis para
            realizar seu procedimento.
          </p>
        </div>

        {/* CARD PRINCIPAL */}
        <div
          className="
            mx-auto
            max-w-5xl
            rounded-[28px]
            border
            border-white/25
            bg-white
            p-5
            shadow-[0_24px_70px_rgba(61,46,72,0.08)]
            backdrop-blur-sm
            sm:p-7
            md:p-10
          "
        >
          {/* DATA E HORÁRIO */}
          {step === "slot" && (
            <div>
              {/* PROCEDIMENTO SELECIONADO */}
              {procedure && (
                <div
                  className="
                    mb-9
                    flex
                    flex-col
                    gap-4
                    rounded-[20px]
                    border
                    border-[#76509a]/10
                    bg-[#fbf8f4]
                    p-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    md:p-6
                  "
                >
                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-[#76509a]
                      "
                    >
                      Procedimento selecionado
                    </p>

                    <h3
                      className="
                        mt-2
                        font-display
                        text-2xl
                        text-[#2f302d]
                        md:text-3xl
                      "
                    >
                      {procedure.name}
                    </h3>

                    <p
                      className="
                        mt-2
                        max-w-2xl
                        text-sm
                        leading-6
                        text-[#74706c]
                      "
                    >
                      {procedure.short_description ||
                        procedure.description ||
                        "Escolha abaixo a melhor data e horário para seu atendimento."}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#76509a]/10
                      text-lg
                      text-[#76509a]
                    "
                  >
                    ✦
                  </div>
                </div>
              )}

              {loadingSlots && (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#6d6863]">
                    Carregando horários disponíveis...
                  </p>
                </div>
              )}

              {!loadingSlots && (
                <div className="space-y-10">
                  {/* DATAS */}
                  <div>
                    <div
                      className="
                        mb-5
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >
                      <div>
                        <p
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.18em]
                            text-[#76509a]
                          "
                        >
                          Etapa 1
                        </p>

                        <h3
                          className="
                            mt-1
                            font-display
                            text-2xl
                            text-[#2f302d]
                          "
                        >
                          Escolha a data
                        </h3>
                      </div>

                      <span
                        className="
                          hidden
                          text-sm
                          text-[#87817c]
                          sm:block
                        "
                      >
                        Próximos 14 dias
                      </span>
                    </div>

                    <div
                      className="
                        mb-3
                        flex
                        items-center
                        gap-2
                        text-[13px]
                        font-semibold
                        text-[#76509a]
                      "
                    >
                      <span aria-hidden="true">
                        ←
                      </span>

                      <span>
                        Deslize para ver os próximos dias
                      </span>

                      <span aria-hidden="true">
                        →
                      </span>
                    </div>

                    <div
                      className="
                        flex
                        snap-x
                        snap-mandatory
                        gap-3
                        overflow-x-auto
                        overscroll-x-contain
                        pb-3
                        [&::-webkit-scrollbar]:hidden
                      "
                      style={{
                        scrollbarWidth:
                          "none",
                        WebkitOverflowScrolling:
                          "touch",
                      }}
                    >
                      {bookingDates.map(
                        (date) => {
                          const selected =
                            selectedDate ===
                            date;

                          const sunday =
                            isSunday(date);

                          const dateSlots =
                            slotsByDate.get(
                              date
                            ) ?? [];

                          const openCount =
                            dateSlots.filter(
                              (slot) =>
                                slot.status ===
                                "open"
                            ).length;

                          return (
                            <button
                              key={date}
                              type="button"
                              disabled={sunday}
                              onClick={() => {
                                if (sunday) {
                                  return;
                                }

                                selectDate(
                                  date
                                );
                              }}
                              aria-label={
                                sunday
                                  ? `${formatDateLong(
                                      date
                                    )} - fechado`
                                  : `${formatDateLong(
                                      date
                                    )} - ${openCount} horário(s) livre(s)`
                              }
                              className={`
                                flex
                                min-h-[105px]
                                w-[150px]
                                min-w-[150px]
                                flex-none
                                snap-start
                                flex-col
                                items-center
                                justify-center
                                rounded-[18px]
                                border
                                px-2
                                py-4
                                text-center
                                transition-all
                                duration-300
                                ${
                                  sunday
                                    ? "cursor-not-allowed border-[#e8e2e9] bg-[#f4f1f5] text-[#aaa3ac] opacity-70"
                                    : selected
                                      ? "border-[#76509a] bg-[#76509a] text-white shadow-[0_12px_25px_rgba(118,80,154,0.22)] -translate-y-1"
                                      : "border-[#ded5e4] bg-white text-[#3f3b3f] hover:-translate-y-1 hover:border-[#76509a]/45 hover:shadow-md"
                                }
                              `}
                            >
                              <span
                                className={`
                                  text-[11px]
                                  font-semibold
                                  uppercase
                                  tracking-[0.12em]
                                  ${
                                    selected
                                      ? "text-white/75"
                                      : "text-[#8a828b]"
                                  }
                                `}
                              >
                                {getWeekday(
                                  date
                                )}
                              </span>

                              <span
                                className="
                                  my-1
                                  font-display
                                  text-3xl
                                  leading-none
                                "
                              >
                                {getDayNumber(
                                  date
                                )}
                              </span>

                              <span
                                className={`
                                  text-xs
                                  capitalize
                                  ${
                                    selected
                                      ? "text-white/80"
                                      : "text-[#877f79]"
                                  }
                                `}
                              >
                                {getMonth(
                                  date
                                )}
                              </span>

                              <span
                                className={`
                                  mt-2
                                  rounded-full
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-bold
                                  leading-none
                                  ${
                                    sunday
                                      ? "bg-[#e8e3e9] text-[#8f8791]"
                                      : selected
                                        ? "bg-white/15 text-white"
                                        : openCount > 0
                                          ? "bg-[#efe6f4] text-[#704093]"
                                          : "bg-[#f1eef1] text-[#999198]"
                                  }
                                `}
                              >
                                {sunday
                                  ? "Fechado"
                                  : openCount > 0
                                    ? `${openCount} livre${
                                        openCount === 1
                                          ? ""
                                          : "s"
                                      }`
                                    : "Sem horários"}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* HORÁRIOS */}
                  {selectedDate && (
                    <div
                      className="
                        border-t
                        border-[#76509a]/10
                        pt-8
                      "
                    >
                      <div
                        className="
                          mb-5
                          flex
                          flex-col
                          gap-2
                          sm:flex-row
                          sm:items-end
                          sm:justify-between
                        "
                      >
                        <div>
                          <p
                            className="
                              text-xs
                              font-semibold
                              uppercase
                              tracking-[0.18em]
                              text-[#76509a]
                            "
                          >
                            Etapa 2
                          </p>

                          <h3
                            className="
                              mt-1
                              font-display
                              text-2xl
                              text-[#2f302d]
                            "
                          >
                            Escolha o horário
                          </h3>
                        </div>

                        <p
                          className="
                            text-sm
                            capitalize
                            text-[#77716c]
                          "
                        >
                          {formatDateLong(
                            selectedDate
                          )}
                        </p>
                      </div>

                      <div
                        className="
                          grid
                          grid-cols-3
                          gap-3
                          sm:grid-cols-4
                          md:grid-cols-5
                          lg:grid-cols-6
                        "
                      >
                        {(
                          slotsByDate.get(
                            selectedDate
                          ) ?? []
                        ).length === 0 ? (
                          <div
                            className="
                              col-span-3
                              rounded-[16px]
                              border
                              border-[#76509a]/10
                              bg-[#faf7fb]
                              px-4
                              py-6
                              text-center
                              sm:col-span-4
                              md:col-span-5
                              lg:col-span-6
                            "
                          >
                            <p
                              className="
                                text-sm
                                font-semibold
                                text-[#5f5961]
                              "
                            >
                              Nenhum horário cadastrado
                              para este dia.
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                leading-5
                                text-[#8b848d]
                              "
                            >
                              Deslize os dias acima e
                              escolha outra data.
                            </p>
                          </div>
                        ) : (
                          (
                            slotsByDate.get(
                              selectedDate
                            ) ?? []
                          ).map(
                            (slot) => {
                              const isOpen =
                                slot.status ===
                                "open";

                              const isBooked =
                                slot.status ===
                                "booked";

                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  disabled={
                                    !isOpen
                                  }
                                  onClick={() => {
                                    if (
                                      !isOpen
                                    ) {
                                      return;
                                    }

                                    selectSlot(
                                      slot
                                    );
                                  }}
                                  className={`
                                    relative
                                    min-h-[62px]
                                    rounded-[15px]
                                    border
                                    px-3
                                    py-3
                                    text-center
                                    transition-all
                                    duration-300
                                    ${
                                      isOpen
                                        ? "border-[#dcd3e1] bg-white text-[#76509a] shadow-sm hover:-translate-y-1 hover:border-[#76509a] hover:bg-[#76509a] hover:text-white hover:shadow-[0_10px_22px_rgba(118,80,154,0.18)]"
                                        : isBooked
                                          ? "cursor-not-allowed border-[#ded8e2] bg-[#f4f1f5]/70 text-[#9b939e] opacity-65"
                                          : "cursor-not-allowed border-[#e4e0e4] bg-[#f7f5f6] text-[#b2abb3] opacity-55"
                                    }
                                  `}
                                >
                                  <span
                                    className="
                                      block
                                      text-[15px]
                                      font-bold
                                    "
                                  >
                                    {slot.slot_time.slice(
                                      0,
                                      5
                                    )}
                                  </span>

                                  {!isOpen && (
                                    <span
                                      className="
                                        mt-1
                                        block
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.12em]
                                      "
                                    >
                                      {isBooked
                                        ? "Agendado"
                                        : "Indisponível"}
                                    </span>
                                  )}
                                </button>
                              );
                            }
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p
                  className="
                    mt-6
                    rounded-[15px]
                    border
                    border-red-200
                    bg-red-50
                    px-5
                    py-4
                    text-sm
                    text-red-700
                  "
                >
                  {error}
                </p>
              )}
            </div>
          )}

          {/* DADOS */}
          {step === "data" &&
            procedure &&
            selectedSlot && (
              <form
                onSubmit={handleSubmit}
                className="space-y-7"
              >
                <button
                  type="button"
                  onClick={() => {
                    setStep("slot");
                    setSelectedSlot(null);
                    setError(null);
                  }}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-[#76509a]
                    transition
                    hover:opacity-70
                  "
                >
                  ← Trocar data ou horário
                </button>

                {/* RESUMO */}
                <div
                  className="
                    rounded-[20px]
                    border
                    border-[#76509a]/15
                    bg-[#f9f5fb]
                    p-5
                    sm:p-6
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-[#76509a]
                    "
                  >
                    Seu agendamento
                  </p>

                  <div
                    className="
                      mt-4
                      grid
                      gap-5
                      sm:grid-cols-3
                    "
                  >
                    <div>
                      <span className="block text-xs text-[#8c8580]">
                        Procedimento
                      </span>

                      <strong className="mt-1 block text-sm text-[#353431]">
                        {procedure.name}
                      </strong>
                    </div>

                    <div>
                      <span className="block text-xs text-[#8c8580]">
                        Data
                      </span>

                      <strong className="mt-1 block text-sm text-[#353431]">
                        {new Date(
                          `${selectedSlot.slot_date}T00:00:00`
                        ).toLocaleDateString(
                          "pt-BR"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span className="block text-xs text-[#8c8580]">
                        Horário
                      </span>

                      <strong className="mt-1 block text-sm text-[#353431]">
                        {selectedSlot.slot_time.slice(
                          0,
                          5
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                <div>
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-[#76509a]
                    "
                  >
                    Etapa 3
                  </p>

                  <h3
                    className="
                      mt-1
                      font-display
                      text-2xl
                      text-[#2f302d]
                    "
                  >
                    Seus dados
                  </h3>
                </div>

                {/* NOME */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-[#383632]
                    "
                  >
                    Nome completo
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    required
                    minLength={3}
                    maxLength={150}
                    autoComplete="name"
                    placeholder="Digite seu nome completo"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-[15px]
                      border
                      border-[#ddd4df]
                      bg-white
                      px-4
                      py-3.5
                      text-sm
                      text-[#353431]
                      outline-none
                      transition
                      placeholder:text-[#aaa39e]
                      focus:border-[#76509a]
                      focus:ring-4
                      focus:ring-[#76509a]/10
                    "
                  />
                </div>

                <div
                  className="
                    grid
                    gap-5
                    md:grid-cols-2
                  "
                >
                  {/* TELEFONE */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-[#383632]
                      "
                    >
                      Celular / WhatsApp
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      required
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          maskPhone(
                            event.target.value
                          )
                        )
                      }
                      className="
                        w-full
                        rounded-[15px]
                        border
                        border-[#ddd4df]
                        bg-white
                        px-4
                        py-3.5
                        text-sm
                        text-[#353431]
                        outline-none
                        transition
                        placeholder:text-[#aaa39e]
                        focus:border-[#76509a]
                        focus:ring-4
                        focus:ring-[#76509a]/10
                      "
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-[#383632]
                      "
                    >
                      E-mail
                    </label>

                    <input
                      id="email"
                      type="email"
                      required
                      maxLength={254}
                      autoComplete="email"
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      className="
                        w-full
                        rounded-[15px]
                        border
                        border-[#ddd4df]
                        bg-white
                        px-4
                        py-3.5
                        text-sm
                        text-[#353431]
                        outline-none
                        transition
                        placeholder:text-[#aaa39e]
                        focus:border-[#76509a]
                        focus:ring-4
                        focus:ring-[#76509a]/10
                      "
                    />
                  </div>
                </div>

                {/* LGPD */}
                <label
                  htmlFor="lgpd-consent"
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-[15px]
                    bg-[#faf7f3]
                    p-4
                    text-sm
                    leading-6
                    text-[#6e6965]
                  "
                >
                  <input
                    id="lgpd-consent"
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(event) =>
                      setConsent(
                        event.target.checked
                      )
                    }
                    className="
                      mt-1
                      h-4
                      w-4
                      accent-[#76509a]
                    "
                  />

                  <span>
                    Concordo com o uso do meu
                    nome, telefone e e-mail
                    exclusivamente para
                    confirmação e gestão do
                    agendamento.
                  </span>
                </label>

                {error && (
                  <p
                    className="
                      rounded-[15px]
                      border
                      border-red-200
                      bg-red-50
                      px-5
                      py-4
                      text-sm
                      text-red-700
                    "
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    w-full
                    rounded-[16px]
                    bg-[#76509a]
                    px-6
                    py-4
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_12px_28px_rgba(118,80,154,0.22)]
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#654184]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {submitting
                    ? "Confirmando..."
                    : `Confirmar ${procedure.name}`}
                </button>
              </form>
            )}

          {/* SUCESSO */}
          {step === "success" &&
            procedure && (
              <div
                className="
                  py-8
                  text-center
                  sm:py-12
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-[#76509a]
                    text-2xl
                    text-white
                    shadow-[0_12px_28px_rgba(118,80,154,0.22)]
                  "
                >
                  ✓
                </div>

                <h3
                  className="
                    mt-6
                    font-display
                    text-3xl
                    text-[#2f302d]
                    md:text-4xl
                  "
                >
                  Agendamento confirmado!
                </h3>

                <p
                  className="
                    mx-auto
                    mt-3
                    max-w-lg
                    text-sm
                    leading-7
                    text-[#77716c]
                    md:text-base
                  "
                >
                  Seu agendamento para{" "}
                  <strong className="text-[#76509a]">
                    {procedure.name}
                  </strong>{" "}
                  foi confirmado com sucesso.
                </p>

                <button
                  type="button"
                  onClick={restart}
                  className="
                    mt-7
                    rounded-full
                    border
                    border-[#76509a]/30
                    bg-white
                    px-7
                    py-3
                    text-sm
                    font-semibold
                    text-[#76509a]
                    transition
                    hover:border-[#76509a]
                    hover:bg-[#76509a]/5
                  "
                >
                  Fazer outro agendamento
                </button>
              </div>
            )}
        </div>
      </div>
    </section>
  );
}