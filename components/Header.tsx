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
  const [open, setOpen] =
    useState(false);

  return (
    <header
      className="
        absolute
        inset-x-0
        top-0
        z-50
        w-full
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1500px]
          px-3
          pt-3

          sm:px-6
          md:px-8
          lg:px-10
        "
      >
        <div
          className="
            flex
            min-h-[70px]
            items-center
            justify-between
            gap-3

            rounded-[18px]

            border
            border-[#76509a]/10

            bg-[#fffaf4]/95

            px-4

            shadow-[0_8px_28px_rgba(72,43,91,0.08)]

            backdrop-blur-xl

            sm:min-h-[72px]
            sm:px-5

            lg:px-6
          "
        >
          {/* ================================= */}
          {/* MARCA                           */}
          {/* ================================= */}

          <a
            href="#inicio"
            aria-label="Juliana Vieira - Início"
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            {/* JV */}

            <div
              className="
                relative
                flex
                h-[45px]
                w-[45px]
                shrink-0
                items-center
                justify-center
              "
            >
              <div
                className="
                  absolute
                  inset-0
                  border
                  border-[#76509a]/35
                "
              />

              <span
                className="
                  relative
                  z-10
                  font-display
                  text-[24px]
                  font-medium
                  italic
                  leading-none
                  tracking-[-0.12em]
                  text-[#704093]
                "
              >
                JV
              </span>

              <span
                aria-hidden="true"
                className="
                  absolute
                  right-[-5px]
                  top-[8px]
                  h-px
                  w-[20px]
                  rotate-[-20deg]
                  bg-[#704093]
                "
              />
            </div>

            {/* NOME */}

            <div className="min-w-0">
              <p
                className="
                  whitespace-nowrap
                  font-display
                  text-[16px]
                  font-semibold
                  leading-none
                  tracking-[0.01em]
                  text-[#56366f]

                  sm:text-[18px]
                "
              >
                Juliana Vieira
              </p>

              <p
                className="
                  mt-1.5
                  whitespace-nowrap
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.23em]
                  text-[#76509a]/75

                  sm:text-[8px]
                "
              >
                Farmacêutica Esteta
              </p>
            </div>
          </a>

          {/* ================================= */}
          {/* MENU DESKTOP                     */}
          {/* ================================= */}

          <nav
            className="
              hidden
              items-center
              gap-7
              lg:flex
              xl:gap-9
            "
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="
                  text-[13px]
                  font-semibold
                  text-[#5f5662]
                  transition
                  hover:text-[#704093]
                "
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ================================= */}
          {/* BOTÕES                           */}
          {/* ================================= */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <a
              href="#agendar"
              className="
                hidden
                min-h-[46px]
                items-center
                justify-center
                rounded-full
                bg-[#704093]
                px-5
                text-[13px]
                font-bold
                text-white
                shadow-[0_10px_24px_rgba(86,48,112,0.22)]
                transition
                hover:bg-[#5d347b]

                sm:inline-flex
              "
            >
              Agende seu horário

              <span
                aria-hidden="true"
                className="
                  ml-2
                  text-lg
                  leading-none
                "
              >
                →
              </span>
            </a>

            {/* MENU MOBILE */}

            <button
              type="button"
              onClick={() =>
                setOpen(
                  (current) =>
                    !current
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
                h-[44px]
                w-[44px]
                shrink-0
                items-center
                justify-center

                rounded-full

                border
                border-[#76509a]/15

                bg-[#fffaf4]

                text-[21px]
                font-semibold
                text-[#704093]

                shadow-sm

                transition

                active:scale-95

                lg:hidden
              "
            >
              {open ? "×" : "☰"}
            </button>
          </div>
        </div>

        {/* ================================= */}
        {/* MENU ABERTO MOBILE               */}
        {/* ================================= */}

        {open && (
          <div
            id="mobile-menu"
            className="
              mt-2
              overflow-hidden

              rounded-[16px]

              border
              border-[#76509a]/10

              bg-[#fffaf4]/98

              p-2

              shadow-[0_18px_45px_rgba(72,43,91,0.12)]

              backdrop-blur-xl

              lg:hidden
            "
          >
            <nav className="flex flex-col">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() =>
                    setOpen(false)
                  }
                  className="
                    rounded-[12px]
                    px-4
                    py-3
                    text-[14px]
                    font-semibold
                    text-[#5d5260]
                    transition

                    hover:bg-[#76509a]/5
                    hover:text-[#704093]
                  "
                >
                  {link.label}
                </a>
              ))}

              <a
                href="#agendar"
                onClick={() =>
                  setOpen(false)
                }
                className="
                  mt-1
                  inline-flex
                  min-h-[46px]
                  items-center
                  justify-center

                  rounded-[10px]

                  bg-[#704093]

                  px-5

                  text-[12px]
                  font-bold
                  text-white

                  sm:hidden
                "
              >
                Agende seu horário

                <span
                  aria-hidden="true"
                  className="
                    ml-2
                    text-lg
                  "
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