"use client";

import { useState } from "react";

const LINKS = [
  {
    label: "Procedimentos",
    href: "#procedimentos",
  },
  {
    label: "Agendar",
    href: "#agendar",
  },
];

export default function Header() {
  const [open, setOpen] =
    useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 w-full">
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-7xl
          items-center
          justify-between
          gap-3
          px-4
          py-3
          sm:px-6
          sm:py-4
          md:px-8
          md:py-5
        "
      >
        {/* LOGO COMPLETO */}
        <a
          href="#"
          aria-label="Juliana Vieira - Início"
          className="
            flex
            min-w-0
            items-center
            gap-2.5
            sm:gap-3
          "
        >
          {/* SÍMBOLO JV */}
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              border
              border-[#76509a]/60
              bg-[#fff8ef]/50
              sm:h-12
              sm:w-12
            "
          >
            <span
              className="
                font-display
                text-xl
                font-medium
                leading-none
                text-[#76509a]
                sm:text-2xl
              "
            >
              JV
            </span>
          </div>

          {/* NOME + PROFISSÃO */}
          <div className="flex min-w-0 flex-col">
            <span
              className="
                whitespace-nowrap
                font-display
                text-[15px]
                font-semibold
                leading-tight
                tracking-[0.02em]
                text-[#6f4590]
                sm:text-lg
              "
            >
              Juliana Vieira
            </span>

            <span
              className="
                mt-0.5
                whitespace-nowrap
                text-[7px]
                font-semibold
                uppercase
                leading-none
                tracking-[0.22em]
                text-[#76509a]/80
                sm:text-[9px]
              "
            >
              Farmacêutica Esteta
            </span>
          </div>
        </a>

        {/* MENU DESKTOP */}
        <nav
          className="
            hidden
            items-center
            gap-8
            md:flex
            lg:gap-10
          "
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="
                text-sm
                font-bold
                text-[#6f4590]
                transition
                duration-200
                hover:scale-105
                hover:text-[#56366f]
              "
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* MENU MOBILE */}
        <button
          type="button"
          onClick={() =>
            setOpen(
              (current) => !current
            )
          }
          aria-label={
            open
              ? "Fechar menu"
              : "Abrir menu"
          }
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            text-2xl
            font-bold
            text-[#6f4590]
            transition
            hover:bg-[#76509a]/10
            md:hidden
          "
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* MENU ABERTO NO CELULAR */}
      {open && (
        <div
          id="mobile-menu"
          className="
            border-t
            border-[#76509a]/15
            bg-[#fff8ef]/95
            shadow-sm
            backdrop-blur-md
            md:hidden
          "
        >
          <nav
            className="
              mx-auto
              flex
              w-full
              max-w-7xl
              flex-col
              px-4
              py-2
              sm:px-6
            "
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() =>
                  setOpen(false)
                }
                className="
                  border-b
                  border-[#76509a]/10
                  py-4
                  text-base
                  font-semibold
                  text-[#6f4590]
                  transition
                  last:border-b-0
                  hover:text-[#56366f]
                "
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}