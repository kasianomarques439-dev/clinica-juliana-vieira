"use client";

import { useRef, useState } from "react";
import type { Procedure } from "@/types/database";
import ProcedureCard from "./ProcedureCard";

type ProceduresGridProps = { procedures: Procedure[] };

export default function ProceduresGrid({ procedures }: ProceduresGridProps) {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const mobileGroups: Procedure[][] = [];
  for (let index = 0; index < procedures.length; index += 2) {
    mobileGroups.push(procedures.slice(index, index + 2));
  }

  function handleCarouselScroll() {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const pages = Array.from(carousel.querySelectorAll<HTMLElement>("[data-procedure-page]"));
    if (!pages.length) return;
    let closestIndex = 0;
    let closestDistance = Infinity;
    pages.forEach((page, index) => {
      const distance = Math.abs(page.offsetLeft - carousel.scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setCurrentPage(closestIndex);
  }

  function goToPage(index: number) {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const page = carousel.querySelectorAll<HTMLElement>("[data-procedure-page]")[index];
    if (!page) return;
    carousel.scrollTo({ left: page.offsetLeft, behavior: "smooth" });
    setCurrentPage(index);
  }

  return (
    <section id="procedimentos" className="relative w-full overflow-hidden bg-gradient-to-br from-[#7d4aa0] via-[#8753a8] to-[#684083] py-10 md:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-[#c99fe0]/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[1450px]">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-[#ead9b6] sm:text-xs">Catálogo</p>
              <h2 className="mt-2 font-display text-[36px] font-semibold leading-none text-white sm:text-4xl md:text-5xl">Procedimentos</h2>
              <p className="mt-3 max-w-[290px] text-[16px] font-medium leading-[1.45] text-white/90 sm:max-w-none sm:text-base">
                Escolha o procedimento que deseja conhecer.
              </p>
            </div>

            {procedures.length > 2 && (
              <button
                type="button"
                onClick={() => { setShowAll((v) => !v); setCurrentPage(0); }}
                className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-full border border-[#ecd6aa] bg-[#f5dfb6] px-4 py-2 text-[13px] font-bold text-[#56366f] shadow-[0_8px_20px_rgba(56,27,74,0.18)] transition hover:-translate-y-0.5 hover:bg-[#ffe8bd] active:scale-[0.98] sm:hidden"
                aria-expanded={showAll}
              >
                {showAll ? "Ver carrossel" : "Visualizar todos"}<span aria-hidden="true" className="text-lg leading-none">→</span>
              </button>
            )}
          </div>
        </div>

        {procedures.length === 0 ? (
          <div className="px-4 pt-8 sm:px-6 lg:px-8">
            <div className="rounded-[20px] border border-white/15 bg-white/10 p-5 text-[16px] text-white/90 backdrop-blur-sm">
              Nenhum procedimento cadastrado no momento.
            </div>
          </div>
        ) : (
          <>
            {!showAll && mobileGroups.length > 1 && (
              <div className="mt-6 px-4 sm:hidden">
                <div className="flex min-h-[74px] items-center gap-4 rounded-[18px] border border-white/20 bg-[#d9c5e7] px-4 py-3 shadow-[0_10px_24px_rgba(49,21,67,0.13)]">
                  <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#704093] text-white" aria-hidden="true">
                    <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
                      <path d="M7 8h18M7 8l4-4M7 8l4 4M25 24H7m18 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 12v8m0 0-3-3m3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".8" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[17px] font-extrabold leading-tight text-[#56366f]">Deslize para o lado</p>
                    <p className="mt-1 text-[14px] font-semibold leading-tight text-[#704093]">para ver mais procedimentos</p>
                  </div>
                  <span aria-hidden="true" className="ml-auto shrink-0 text-[30px] font-light leading-none text-[#704093]">→</span>
                </div>
              </div>
            )}

            {showAll && (
              <div className="grid gap-4 px-4 pt-6 sm:hidden">
                {procedures.map((procedure) => <ProcedureCard key={procedure.id} procedure={procedure} />)}
              </div>
            )}

            {!showAll && (
              <>
                <div
                  ref={carouselRef}
                  onScroll={handleCarouselScroll}
                  className="mt-5 flex w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-5 sm:hidden [&::-webkit-scrollbar]:hidden"
                  style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
                  aria-label="Carrossel de procedimentos"
                >
                  {mobileGroups.map((group, groupIndex) => (
                    <div key={group[0]?.id ?? `grupo-${groupIndex}`} data-procedure-page className="flex w-[88vw] max-w-[390px] flex-none snap-start flex-col gap-4">
                      {group.map((procedure) => <ProcedureCard key={procedure.id} procedure={procedure} />)}
                    </div>
                  ))}
                  <div aria-hidden="true" className="w-1 shrink-0" />
                </div>

                {mobileGroups.length > 1 && (
                  <>
                    <div className="mt-1 flex items-center justify-center gap-3 px-4 sm:hidden" aria-label="Páginas do catálogo">
                      {mobileGroups.map((_group, index) => {
                        const active = currentPage === index;
                        return (
                          <button
                            type="button"
                            key={index}
                            onClick={() => goToPage(index)}
                            aria-label={`Ir para a página ${index + 1}`}
                            aria-current={active ? "page" : undefined}
                            className={`block h-[11px] rounded-full transition-all duration-300 ${active ? "w-9 bg-white shadow-[0_3px_10px_rgba(0,0,0,0.18)]" : "w-[11px] bg-white/35"}`}
                          />
                        );
                      })}
                    </div>
                    <p className="mt-3 text-center text-[13px] font-semibold text-white/80 sm:hidden">{currentPage + 1} de {mobileGroups.length}</p>
                  </>
                )}
              </>
            )}

            <div className="hidden px-6 pt-8 sm:grid sm:grid-cols-2 sm:gap-5 lg:px-8 xl:grid-cols-4">
              {procedures.map((procedure) => <ProcedureCard key={procedure.id} procedure={procedure} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
