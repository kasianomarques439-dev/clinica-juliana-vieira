"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { Procedure } from "@/types/database";
import ProcedureCard from "./ProcedureCard";

type ProceduresGridProps = {
  procedures: Procedure[];
};

type Category =
  | "Todos"
  | "Botox"
  | "Preenchimentos"
  | "Bioestimuladores";

function getCategory(
  procedure: Procedure
): Category | "Outros" {
  const name =
    procedure.name.toLowerCase();

  if (
    name.includes("toxina") ||
    name.includes("botox")
  ) {
    return "Botox";
  }

  if (
    name.includes("preenchimento") ||
    name.includes("labial") ||
    name.includes("malar") ||
    name.includes("mandíbula") ||
    name.includes("mandibula") ||
    name.includes("mento") ||
    name.includes("marionete") ||
    name.includes("bigode") ||
    name.includes("olheira")
  ) {
    return "Preenchimentos";
  }

  if (
    name.includes("bioestimulador")
  ) {
    return "Bioestimuladores";
  }

  return "Outros";
}

export default function ProceduresGrid({
  procedures,
}: ProceduresGridProps) {
  const [category, setCategory] =
    useState<Category>("Todos");

  const [showAll, setShowAll] =
    useState(false);

  const [
    selectedProcedure,
    setSelectedProcedure,
  ] =
    useState<Procedure | null>(null);

  const filteredProcedures =
    useMemo(() => {
      if (category === "Todos") {
        return procedures;
      }

      return procedures.filter(
        (procedure) =>
          getCategory(procedure) ===
          category
      );
    }, [procedures, category]);

  const visibleMobileProcedures =
    showAll
      ? filteredProcedures
      : filteredProcedures.slice(0, 4);

  function handleCategory(
    selected: Category
  ) {
    setCategory(selected);
    setShowAll(false);
  }

  function handleSchedule(
    procedure: Procedure
  ) {
    setSelectedProcedure(null);

    window.dispatchEvent(
      new CustomEvent(
        "select-procedure-for-booking",
        {
          detail: procedure,
        }
      )
    );

    window.setTimeout(() => {
      const booking =
        document.getElementById(
          "agendar"
        );

      booking?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  const categories: Category[] = [
    "Todos",
    "Botox",
    "Preenchimentos",
    "Bioestimuladores",
  ];

  return (
    <section
      id="procedimentos"
      className="
        relative
        overflow-hidden
        bg-[#fffaf4]
        py-12
        sm:py-20
        md:py-24
      "
    >
      {/* ======================================= */}
      {/* DECORAÇÃO DE FUNDO                      */}
      {/* ======================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-28
          top-24
          h-72
          w-72
          rounded-full
          bg-[#e8d9f0]/35
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-28
          bottom-0
          h-72
          w-72
          rounded-full
          bg-[#ead8df]/30
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          w-full
          max-w-[1450px]
        "
      >
        {/* ======================================= */}
        {/* TÍTULO                                  */}
        {/* ======================================= */}

        <div
          className="
            px-5
            text-center
            sm:px-6
            lg:px-8
          "
        >
          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.23em]
              text-[#76509a]
              sm:text-[11px]
            "
          >
            Nossos procedimentos
          </p>

          <h2
            className="
              mx-auto
              mt-2
              max-w-[310px]
              font-display
              text-[31px]
              font-medium
              leading-[1.03]
              tracking-[-0.02em]
              text-[#56366f]

              sm:max-w-none
              sm:text-[44px]

              md:text-[52px]
            "
          >
            <span className="sm:hidden">
              Escolha o tratamento
              <br />
              ideal para você
            </span>

            <span className="hidden sm:inline">
              Procedimentos
            </span>
          </h2>

          <div
            className="
              mx-auto
              mt-3
              flex
              items-center
              justify-center
              gap-2
              sm:hidden
            "
          >
            <span
              className="
                h-px
                w-8
                bg-[#76509a]/25
              "
            />

            <span
              className="
                text-[12px]
                text-[#76509a]
              "
            >
              ✦
            </span>

            <span
              className="
                h-px
                w-8
                bg-[#76509a]/25
              "
            />
          </div>

          <p
            className="
              mx-auto
              mt-4
              hidden
              max-w-2xl
              text-[15px]
              font-medium
              leading-7
              text-[#716a73]
              sm:block
              md:text-[16px]
            "
          >
            Conheça os tratamentos
            disponíveis e escolha o
            cuidado que mais combina
            com você.
          </p>
        </div>

        {procedures.length === 0 ? (
          <div className="px-5 pt-8">
            <div
              className="
                mx-auto
                max-w-2xl
                rounded-[20px]
                border
                border-[#76509a]/10
                bg-white
                p-6
                text-center
                text-[14px]
                font-medium
                text-[#6f6670]
              "
            >
              Nenhum procedimento
              cadastrado no momento.
            </div>
          </div>
        ) : (
          <>
            {/* ======================================= */}
            {/* MOBILE — FILTROS                        */}
            {/* ======================================= */}

            <div
              className="
                mt-7
                flex
                gap-2
                overflow-x-auto
                px-5
                pb-1
                sm:hidden
                [&::-webkit-scrollbar]:hidden
              "
              style={{
                scrollbarWidth:
                  "none",
              }}
            >
              {categories.map(
                (item) => {
                  const active =
                    category === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        handleCategory(
                          item
                        )
                      }
                      className={`
                        min-h-[34px]
                        shrink-0
                        rounded-[7px]
                        border
                        px-4
                        text-[10px]
                        font-semibold
                        transition
                        ${
                          active
                            ? "border-[#704093] bg-[#704093] text-white shadow-sm"
                            : "border-[#76509a]/12 bg-white text-[#5f5861]"
                        }
                      `}
                    >
                      {item}
                    </button>
                  );
                }
              )}
            </div>

            {/* ======================================= */}
            {/* MOBILE — CARDS 2 POR LINHA              */}
            {/* ======================================= */}

            <div
              className="
                mt-6
                grid
                grid-cols-2
                gap-3
                px-5
                sm:hidden
              "
            >
              {visibleMobileProcedures.map(
                (procedure) => (
                  <article
                    key={procedure.id}
                    className="
                      overflow-hidden
                      rounded-[12px]
                      border
                      border-[#76509a]/10
                      bg-white
                      shadow-[0_8px_25px_rgba(74,45,89,0.05)]
                    "
                  >
                    {/* FOTO */}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedProcedure(
                          procedure
                        )
                      }
                      className="
                        relative
                        block
                        aspect-[1.28/1]
                        w-full
                        overflow-hidden
                        bg-[#eee4ef]
                        text-left
                      "
                    >
                      {procedure.image_url ? (
                        <Image
                          src={
                            procedure.image_url
                          }
                          alt={
                            procedure.name
                          }
                          fill
                          sizes="45vw"
                          className="
                            object-cover
                            object-center
                            transition
                            duration-500
                            hover:scale-105
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-full
                            items-center
                            justify-center
                            bg-gradient-to-br
                            from-[#efe2f2]
                            to-[#fbf5f0]
                          "
                        >
                          <span
                            className="
                              font-display
                              text-3xl
                              text-[#76509a]
                            "
                          >
                            JV
                          </span>
                        </div>
                      )}
                    </button>

                    {/* CONTEÚDO */}

                    <div className="p-3">
                      <h3
                        className="
                          min-h-[34px]
                          font-display
                          text-[14px]
                          font-semibold
                          leading-[1.15]
                          text-[#56366f]
                        "
                      >
                        {procedure.name}
                      </h3>

                      <p
                        className="
                          mt-2
                          line-clamp-3
                          min-h-[45px]
                          text-[9px]
                          font-medium
                          leading-[1.55]
                          text-[#686169]
                        "
                      >
                        {procedure.short_description ||
                          procedure.description}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedProcedure(
                            procedure
                          )
                        }
                        className="
                          mt-3
                          inline-flex
                          items-center
                          gap-1
                          text-[9px]
                          font-bold
                          text-[#704093]
                        "
                      >
                        Saiba mais
                        <span
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>

            {/* SEM RESULTADOS NO FILTRO */}

            {filteredProcedures.length ===
              0 && (
              <div
                className="
                  mx-5
                  mt-6
                  rounded-[14px]
                  border
                  border-[#76509a]/10
                  bg-white
                  p-5
                  text-center
                  text-[12px]
                  font-medium
                  text-[#726a73]
                  sm:hidden
                "
              >
                Nenhum procedimento
                desta categoria no
                momento.
              </div>
            )}

            {/* ======================================= */}
            {/* MOBILE — INDICADORES                    */}
            {/* ======================================= */}

            {filteredProcedures.length >
              2 && (
              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  sm:hidden
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-[#704093]
                  "
                />

                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-[#76509a]/20
                  "
                />

                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-[#76509a]/20
                  "
                />

                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-[#76509a]/20
                  "
                />
              </div>
            )}

            {/* ======================================= */}
            {/* MOBILE — VER TODOS                      */}
            {/* ======================================= */}

            {filteredProcedures.length >
              4 && (
              <div
                className="
                  mt-5
                  flex
                  justify-center
                  px-5
                  sm:hidden
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowAll(
                      (current) =>
                        !current
                    )
                  }
                  className="
                    inline-flex
                    min-h-[42px]
                    w-full
                    max-w-[290px]
                    items-center
                    justify-center
                    rounded-[8px]
                    border
                    border-[#704093]
                    bg-transparent
                    px-5
                    text-[11px]
                    font-semibold
                    text-[#704093]
                  "
                >
                  {showAll
                    ? "Mostrar menos"
                    : "Ver todos os procedimentos"}
                </button>
              </div>
            )}

            {/* ======================================= */}
            {/* MOBILE — FAIXA DE AGENDAMENTO           */}
            {/* ======================================= */}

            <div
              className="
                mt-7
                bg-gradient-to-r
                from-[#684083]
                via-[#76509a]
                to-[#8453a5]
                px-6
                py-7
                text-center
                sm:hidden
              "
            >
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-white/75
                "
              >
                Agendamento simples
                e rápido
              </p>

              <h3
                className="
                  mx-auto
                  mt-2
                  max-w-[280px]
                  font-display
                  text-[27px]
                  font-medium
                  leading-[1.05]
                  text-white
                "
              >
                Agende seu horário
                <br />
                com poucos cliques
              </h3>

              <a
                href="#agendar"
                className="
                  mx-auto
                  mt-5
                  flex
                  min-h-[47px]
                  max-w-[285px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[8px]
                  bg-[#56366f]
                  px-5
                  text-[12px]
                  font-bold
                  text-white
                  shadow-[0_10px_24px_rgba(43,23,55,0.22)]
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="6"
                    width="16"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />

                  <path
                    d="M8 3V8M16 3V8M4 10H20"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>

                Agende seu horário
                agora
              </a>
            </div>

            {/* ======================================= */}
            {/* DESKTOP                                 */}
            {/* ======================================= */}

            <div
              className="
                hidden
                px-6
                pt-10
                sm:grid
                sm:grid-cols-2
                sm:gap-5
                lg:px-8
                xl:grid-cols-3
                xl:gap-6
              "
            >
              {procedures.map(
                (procedure) => (
                  <ProcedureCard
                    key={
                      procedure.id
                    }
                    procedure={
                      procedure
                    }
                  />
                )
              )}
            </div>

            <div
              className="
                mt-10
                hidden
                justify-center
                sm:flex
              "
            >
              <a
                href="#agendar"
                className="
                  inline-flex
                  min-h-[50px]
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#76509a]/20
                  bg-[#f2e7f6]
                  px-6
                  text-[13px]
                  font-bold
                  text-[#704093]
                "
              >
                Agendar um procedimento
                <span
                  aria-hidden="true"
                  className="ml-2 text-lg"
                >
                  →
                </span>
              </a>
            </div>
          </>
        )}
      </div>

      {/* ======================================= */}
      {/* MODAL MOBILE DE DETALHES                */}
      {/* ======================================= */}

      {selectedProcedure && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/55
            p-4
            backdrop-blur-sm
            sm:hidden
          "
          onClick={() =>
            setSelectedProcedure(
              null
            )
          }
        >
          <div
            className="
              max-h-[88dvh]
              w-full
              max-w-[390px]
              overflow-y-auto
              rounded-[24px]
              bg-[#fffaf4]
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className="
                relative
                aspect-[1.5/1]
                overflow-hidden
                bg-[#eee4ef]
              "
            >
              {selectedProcedure.image_url && (
                <Image
                  src={
                    selectedProcedure.image_url
                  }
                  alt={
                    selectedProcedure.name
                  }
                  fill
                  sizes="390px"
                  className="object-cover"
                />
              )}

              <button
                type="button"
                onClick={() =>
                  setSelectedProcedure(
                    null
                  )
                }
                aria-label="Fechar"
                className="
                  absolute
                  right-3
                  top-3
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white/90
                  text-lg
                  font-bold
                  text-[#56366f]
                  shadow
                "
              >
                ×
              </button>
            </div>

            <div className="p-5">
              <h3
                className="
                  font-display
                  text-[27px]
                  font-semibold
                  leading-tight
                  text-[#56366f]
                "
              >
                {
                  selectedProcedure.name
                }
              </h3>

              <p
                className="
                  mt-3
                  text-[13px]
                  font-medium
                  leading-6
                  text-[#686068]
                "
              >
                {
                  selectedProcedure.description
                }
              </p>

              {selectedProcedure.duration_minutes && (
                <div
                  className="
                    mt-4
                    inline-flex
                    rounded-full
                    bg-[#f1e6f5]
                    px-4
                    py-2
                    text-[11px]
                    font-bold
                    text-[#704093]
                  "
                >
                  Aproximadamente{" "}
                  {
                    selectedProcedure.duration_minutes
                  }{" "}
                  min
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  handleSchedule(
                    selectedProcedure
                  )
                }
                className="
                  mt-5
                  flex
                  min-h-[48px]
                  w-full
                  items-center
                  justify-center
                  rounded-[10px]
                  bg-[#704093]
                  px-5
                  text-[13px]
                  font-bold
                  text-white
                "
              >
                Agendar este
                procedimento
                <span className="ml-2">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}