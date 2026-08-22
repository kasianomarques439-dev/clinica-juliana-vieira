"use client";

import { useRef, useState } from "react";

import type { Procedure } from "@/types/database";
import ProcedureCard from "./ProcedureCard";

type ProceduresGridProps = {
  procedures: Procedure[];
};

export default function ProceduresGrid({
  procedures,
}: ProceduresGridProps) {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const carouselRef = useRef<HTMLDivElement | null>(null);

  const mobileGroups: Procedure[][] = [];

  for (let index = 0; index < procedures.length; index += 2) {
    mobileGroups.push(procedures.slice(index, index + 2));
  }

  function handleCarouselScroll() {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const pages = Array.from(
      carousel.querySelectorAll<HTMLElement>("[data-procedure-page]")
    );

    if (!pages.length) {
      return;
    }

    let closestIndex = 0;
    let closestDistance = Infinity;

    pages.forEach((page, index) => {
      const distance = Math.abs(
        page.offsetLeft - carousel.scrollLeft
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setCurrentPage(closestIndex);
  }

  function goToPage(index: number) {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const page =
      carousel.querySelectorAll<HTMLElement>(
        "[data-procedure-page]"
      )[index];

    if (!page) {
      return;
    }

    carousel.scrollTo({
      left: page.offsetLeft,
      behavior: "smooth",
    });

    setCurrentPage(index);
  }

  return (
    <section
      id="procedimentos"
      className="relative overflow-hidden bg-[#fffaf4] py-16 sm:py-20 md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full bg-[#e8d9f0]/45 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-[#ead8df]/35 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1450px]">
        <div className="px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#a77f52]">
            Nossos cuidados
          </p>

          <h2 className="mt-3 font-display text-[38px] font-semibold leading-none tracking-[-0.02em] text-[#56366f] sm:text-[44px] md:text-[52px]">
            Procedimentos
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] font-medium leading-7 text-[#716a73] md:text-[16px]">
            Conheça os tratamentos disponíveis e escolha o cuidado que mais
            combina com você.
          </p>
        </div>

        {procedures.length === 0 ? (
          <div className="px-4 pt-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-[22px] border border-[#76509a]/10 bg-white p-6 text-center text-[15px] font-medium text-[#6f6670] shadow-sm">
              Nenhum procedimento cadastrado no momento.
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 flex items-center justify-between gap-3 px-4 sm:hidden">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#56366f]">
                  Escolha um procedimento
                </p>

                <p className="mt-0.5 text-[12px] font-medium text-[#857d86]">
                  Toque no card para ver os detalhes.
                </p>
              </div>

              {procedures.length > 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAll((current) => !current);
                    setCurrentPage(0);
                  }}
                  aria-expanded={showAll}
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full border border-[#76509a]/15 bg-[#f2e7f6] px-4 text-[12px] font-bold text-[#704093] transition active:scale-[0.98]"
                >
                  {showAll ? "Ver carrossel" : "Visualizar todos"}
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </div>

            {!showAll && mobileGroups.length > 1 && (
              <div className="mt-5 px-4 sm:hidden">
                <div className="flex min-h-[68px] items-center gap-3 rounded-[18px] border border-[#76509a]/10 bg-[#f1e7f5] px-4 py-3 shadow-[0_10px_24px_rgba(70,43,84,0.07)]">
                  <div
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#704093] text-white"
                  >
                    <svg
                      viewBox="0 0 32 32"
                      fill="none"
                      className="h-6 w-6"
                    >
                      <path
                        d="M7 8h18M7 8l4-4M7 8l4 4M25 24H7m18 0-4-4m4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[15px] font-extrabold leading-tight text-[#56366f]">
                      Deslize para o lado
                    </p>

                    <p className="mt-0.5 text-[12px] font-semibold text-[#76509a]">
                      para ver mais procedimentos
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="ml-auto text-[27px] font-light text-[#704093]"
                  >
                    →
                  </span>
                </div>
              </div>
            )}

            {showAll && (
              <div className="grid gap-4 px-4 pt-5 sm:hidden">
                {procedures.map((procedure) => (
                  <ProcedureCard
                    key={procedure.id}
                    procedure={procedure}
                  />
                ))}
              </div>
            )}

            {!showAll && (
              <>
                <div
                  ref={carouselRef}
                  onScroll={handleCarouselScroll}
                  aria-label="Carrossel de procedimentos"
                  className="mt-5 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-5 sm:hidden [&::-webkit-scrollbar]:hidden"
                  style={{
                    scrollbarWidth: "none",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {mobileGroups.map((group, groupIndex) => (
                    <div
                      key={group[0]?.id ?? `grupo-${groupIndex}`}
                      data-procedure-page
                      className="flex w-[88vw] max-w-[390px] flex-none snap-start flex-col gap-4"
                    >
                      {group.map((procedure) => (
                        <ProcedureCard
                          key={procedure.id}
                          procedure={procedure}
                        />
                      ))}
                    </div>
                  ))}

                  <div
                    aria-hidden="true"
                    className="w-1 shrink-0"
                  />
                </div>

                {mobileGroups.length > 1 && (
                  <>
                    <div
                      className="mt-1 flex items-center justify-center gap-3 px-4 sm:hidden"
                      aria-label="Páginas do catálogo"
                    >
                      {mobileGroups.map((_group, index) => {
                        const active = currentPage === index;

                        return (
                          <button
                            type="button"
                            key={index}
                            onClick={() => goToPage(index)}
                            aria-label={`Ir para a página ${index + 1}`}
                            aria-current={active ? "page" : undefined}
                            className={`block h-[10px] rounded-full transition-all duration-300 ${
                              active
                                ? "w-8 bg-[#704093]"
                                : "w-[10px] bg-[#76509a]/20"
                            }`}
                          />
                        );
                      })}
                    </div>

                    <p className="mt-3 text-center text-[12px] font-bold text-[#817881] sm:hidden">
                      {currentPage + 1} de {mobileGroups.length}
                    </p>
                  </>
                )}
              </>
            )}

            <div className="hidden px-6 pt-10 sm:grid sm:grid-cols-2 sm:gap-5 lg:px-8 xl:grid-cols-3 xl:gap-6">
              {procedures.map((procedure) => (
                <ProcedureCard
                  key={procedure.id}
                  procedure={procedure}
                />
              ))}
            </div>

            <div className="mt-10 hidden justify-center sm:flex">
              <a
                href="#agendar"
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-[#76509a]/18 bg-[#f2e7f6] px-6 text-[13px] font-bold text-[#704093] transition hover:-translate-y-0.5 hover:bg-[#eadcf0]"
              >
                Agendar um procedimento

                <span aria-hidden="true" className="ml-2 text-lg">
                  →
                </span>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}