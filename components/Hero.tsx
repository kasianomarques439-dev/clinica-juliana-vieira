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
            gap-4
            rounded-[22px]
            border
            border-[#76509a]/10
            bg-[#fffaf4]/95
            px-4
            shadow-[0_10px_35px_rgba(72,43,91,0.07)]
            backdrop-blur-xl

            sm:px-5
            lg:min-h-[74px]
            lg:px-6
          "
        >
          {/* LOGO */}
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
            {/* MONOGRAMA JV */}
            <div
              className="
                relative
                flex
                h-[48px]
                w-[48px]
                shrink-0
                items-center
                justify-center
                rounded-[15px]
                border
                border-[#9c78b7]/35
                bg-gradient-to-br
                from-white
                to-[#faf3fb]
                shadow-[0_4px_12px_rgba(85,51,108,0.08)]

                sm:h-[50px]
                sm:w-[50px]
              "
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="
                    relative
                    z-10
                    font-display
                    text-[27px]
                    font-medium
                    leading-none
                    tracking-[-0.12em]
                    text-[#6c4389]

                    sm:text-[29px]
                  "
                >
                  J
                </span>

                <span
                  className="
                    relative
                    -ml-[2px]
                    mt-[3px]
                    font-display
                    text-[24px]
                    font-medium
                    italic
                    leading-none
                    tracking-[-0.10em]
                    text-[#8a64a5]

                    sm:text-[26px]
                  "
                >
                  V
                </span>

                {/* detalhe fino do monograma */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 60 25"
                  fill="none"
                  className="
                    pointer-events-none
                    absolute
                    -right-[8px]
                    -top-[7px]
                    h-[18px]
                    w-[35px]
                  "
                >
                  <path
                    d="M2 19C15 18 21 4 34 5C43 6 47 10 57 2"
                    stroke="#8b65a6"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* NOME */}
            <div className="min-w-0">
              <p
                className="
                  whitespace-nowrap
                  font-display
                  text-[18px]
                  font-medium
                  leading-[1]
                  tracking-[0.01em]
                  text-[#5f3a78]

                  sm:text-[21px]
                "
              >
                Juliana Vieira
              </p>

              <div
                className="
                  mt-[5px]
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  aria-hidden="true"
                  className="
                    hidden
                    h-px
                    w-4
                    bg-[#b698c9]
                    sm:block
                  "
                />

                <p
                  className="
                    whitespace-nowrap
                    text-[7px]
                    font-semibold
                    uppercase
                    tracking-[0.27em]
                    text-[#8b6ba0]

                    sm:text-[8px]
                  "
                >
                  Farmacêutica Esteta
                </p>
              </div>
            </div>
          </a>

          {/* MENU DESKTOP */}
          <nav className="hidden items-center gap-7 lg:flex xl:gap-9">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="
                  relative
                  text-[13px]
                  font-semibold
                  text-[#625867]
                  transition
                  duration-200

                  after:absolute
                  after:-bottom-2
                  after:left-1/2
                  after:h-px
                  after:w-0
                  after:-translate-x-1/2
                  after:bg-[#76509a]
                  after:transition-all
                  after:duration-300

                  hover:text-[#704093]
                  hover:after:w-full
                "
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* AÇÕES */}
          <div className="flex items-center gap-2">
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

                hover:-translate-y-0.5
                hover:bg-[#5d347b]

                sm:inline-flex
              "
            >
              Agende seu horário

              <span
                aria-hidden="true"
                className="ml-2 text-lg leading-none"
              >
                →
              </span>
            </a>

            {/* BOTÃO MENU MOBILE */}
            <button
              type="button"
              onClick={() =>
                setOpen((current) => !current)
              }
              aria-label={
                open ? "Fechar menu" : "Abrir menu"
              }
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[#76509a]/15
                bg-white
                text-[22px]
                font-semibold
                text-[#704093]
                shadow-sm
                transition

                hover:bg-[#76509a]/5

                lg:hidden
              "
            >
              {open ? "×" : "☰"}
            </button>
          </div>
        </div>

        {/* MENU MOBILE */}
        {open && (
          <div
            id="mobile-menu"
            className="
              mt-2
              overflow-hidden
              rounded-[20px]
              border
              border-[#76509a]/10
              bg-[#fffaf4]/[0.98]
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
                  onClick={() => setOpen(false)}
                  className="
                    rounded-[14px]
                    px-4
                    py-3.5
                    text-[15px]
                    font-semibold
                    text-[#5d5260]
                    transition

                    hover:bg-[#76509a]/[0.07]
                    hover:text-[#704093]
                  "
                >
                  {link.label}
                </a>
              ))}

              <a
                href="#agendar"
                onClick={() => setOpen(false)}
                className="
                  mt-1
                  inline-flex
                  min-h-[48px]
                  items-center
                  justify-center
                  rounded-[15px]
                  bg-[#704093]
                  px-5
                  text-sm
                  font-bold
                  text-white

                  sm:hidden
                "
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