"use client";

import { useState } from "react";

const LINKS = [
  {
    label: "Início",
    href: "#inicio",
  },
  {
    label: "Procedimentos",
    href: "#procedimentos",
  },
  {
    label: "Agendamento",
    href: "#agendar",
  },
  {
    label: "Instagram",
    href: "#instagram",
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 w-full">
      <div className="mx-auto w-full max-w-[1500px] px-4 pt-3 sm:px-6 md:px-8 lg:px-10">
        <div className="flex min-h-[68px] items-center justify-between gap-4 rounded-[22px] border border-[#76509a]/10 bg-[#fffaf4]/90 px-4 shadow-[0_10px_35px_rgba(72,43,91,0.08)] backdrop-blur-xl sm:px-5 lg:min-h-[72px] lg:px-6">
          <a
            href="#inicio"
            aria-label="Juliana Vieira - Início"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[#76509a]/35 bg-white text-[#76509a] shadow-sm">
              <span className="font-display text-xl font-semibold leading-none">
                JV
              </span>
            </div>

            <div className="min-w-0">
              <p className="whitespace-nowrap font-display text-[16px] font-semibold leading-none text-[#654181] sm:text-[18px]">
                Juliana Vieira
              </p>

              <p className="mt-1 whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.19em] text-[#76509a]/70 sm:text-[9px]">
                Farmacêutica Esteta
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 lg:flex xl:gap-9">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-semibold text-[#5f5662] transition hover:text-[#704093]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#agendar"
              className="hidden min-h-[46px] items-center justify-center rounded-full bg-[#704093] px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(86,48,112,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5d347b] sm:inline-flex"
            >
              Agende seu horário
              <span
                aria-hidden="true"
                className="ml-2 text-lg leading-none"
              >
                →
              </span>
            </a>

            <button
              type="button"
              onClick={() =>
                setOpen((current) => !current)
              }
              aria-label={
                open
                  ? "Fechar menu"
                  : "Abrir menu"
              }
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#76509a]/15 bg-white text-[22px] font-semibold text-[#704093] shadow-sm transition hover:bg-[#76509a]/5 lg:hidden"
            >
              {open ? "×" : "☰"}
            </button>
          </div>
        </div>

        {open && (
          <div
            id="mobile-menu"
            className="mt-2 overflow-hidden rounded-[20px] border border-[#76509a]/10 bg-[#fffaf4]/98 p-2 shadow-[0_18px_45px_rgba(72,43,91,0.12)] backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() =>
                    setOpen(false)
                  }
                  className="rounded-[14px] px-4 py-3.5 text-[15px] font-semibold text-[#5d5260] transition hover:bg-[#76509a]/7 hover:text-[#704093]"
                >
                  {link.label}
                </a>
              ))}

              <a
                href="#agendar"
                onClick={() =>
                  setOpen(false)
                }
                className="mt-1 inline-flex min-h-[48px] items-center justify-center rounded-[15px] bg-[#704093] px-5 text-sm font-bold text-white sm:hidden"
              >
                Agende seu horário
                <span
                  aria-hidden="true"
                  className="ml-2 text-lg"
                >
                  →
                </span>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}