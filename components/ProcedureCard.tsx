"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

import type { Procedure } from "@/types/database";

export default function ProcedureCard({
  procedure,
}: {
  procedure: Procedure;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  /*
   * GARANTE QUE O PORTAL
   * SÓ SEJA CRIADO NO NAVEGADOR
   */
  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /*
   * TRAVA A ROLAGEM DO SITE
   * ENQUANTO O MODAL ESTIVER ABERTO
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow =
      body.style.overflow;

    const previousBodyOverscroll =
      body.style.overscrollBehavior;

    const previousHtmlOverflow =
      html.style.overflow;

    const previousHtmlOverscroll =
      html.style.overscrollBehavior;

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );

      body.style.overflow =
        previousBodyOverflow;

      body.style.overscrollBehavior =
        previousBodyOverscroll;

      html.style.overflow =
        previousHtmlOverflow;

      html.style.overscrollBehavior =
        previousHtmlOverscroll;
    };
  }, [open]);

  /*
   * FECHA O MODAL,
   * SELECIONA O PROCEDIMENTO
   * E ROLA ATÉ O AGENDAMENTO
   */
  function handleSchedule() {
    setOpen(false);

    window.dispatchEvent(
      new CustomEvent(
        "select-procedure-for-booking",
        {
          detail: procedure,
        }
      )
    );

    window.setTimeout(() => {
      document
        .getElementById("agendar")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 200);
  }

  /*
   * MODAL PREMIUM
   *
   * RENDERIZADO DIRETAMENTE NO BODY
   * PARA NÃO SER CORTADO PELO CARROSSEL
   */
  const modal =
    mounted && open
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={procedure.name}
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setOpen(false);
              }
            }}
            className="
              flex
              items-center
              justify-center
              bg-black/60
              px-3
              py-3
              backdrop-blur-[10px]

              md:px-8
              md:py-7
              md:backdrop-blur-[12px]
            "
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              width: "100vw",
              height: "100dvh",
              zIndex: 2147483647,
              isolation: "isolate",
            }}
          >
            {/* ================================= */}
            {/* CARD GRANDE DO MODAL             */}
            {/* ================================= */}

            <div
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
              className="
                relative
                flex
                w-full
                max-w-[430px]
                flex-col
                overflow-hidden
                rounded-[30px]
                border
                border-white/80
                bg-[#fffaf5]
                shadow-[0_30px_100px_rgba(0,0,0,0.50)]

                md:max-w-[610px]
                md:rounded-[38px]
                md:shadow-[0_40px_130px_rgba(0,0,0,0.48)]

                lg:max-w-[630px]
              "
              style={{
                height:
                  "calc(100dvh - 26px)",
                maxHeight: "860px",
              }}
            >
              {/* ================================= */}
              {/* BOTÃO X                         */}
              {/* ================================= */}

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar procedimento"
                className="
                  absolute
                  right-4
                  top-4
                  z-50
                  flex
                  h-[46px]
                  w-[46px]
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/90
                  bg-[#fffaf5]/95
                  text-[29px]
                  font-light
                  leading-none
                  text-[#684086]
                  shadow-[0_7px_22px_rgba(0,0,0,0.18)]
                  backdrop-blur-md
                  transition
                  duration-200

                  hover:scale-105
                  hover:bg-white

                  active:scale-95

                  md:right-6
                  md:top-6
                  md:h-[52px]
                  md:w-[52px]
                  md:text-[32px]
                "
              >
                ×
              </button>

              {/* ================================= */}
              {/* FOTO DO PROCEDIMENTO             */}
              {/* ================================= */}

              <div
                className="
                  relative
                  h-[44%]
                  min-h-[290px]
                  w-full
                  shrink-0
                  overflow-hidden
                  bg-[#eee4f4]

                  md:h-[48%]
                  md:min-h-[350px]
                "
              >
                {procedure.image_url ? (
                  <Image
                    src={
                      procedure.image_url
                    }
                    alt={procedure.name}
                    fill
                    priority
                    sizes="
                      (max-width: 767px) 100vw,
                      630px
                    "
                    className="
                      object-cover
                      object-center
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      items-center
                      justify-center
                      px-4
                      text-center
                      text-sm
                      text-[#76509a]/50
                    "
                  >
                    Sem imagem
                  </div>
                )}

                {/* SOMBRA LEVE NA FOTO */}
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    bottom-0
                    h-28
                    bg-gradient-to-t
                    from-black/15
                    via-black/5
                    to-transparent

                    md:h-32
                  "
                />

                {/* ================================= */}
                {/* CURVA                            */}
                {/* ================================= */}

                <svg
                  aria-hidden="true"
                  viewBox="0 0 1000 150"
                  preserveAspectRatio="none"
                  className="
                    pointer-events-none
                    absolute
                    bottom-[-1px]
                    left-0
                    z-10
                    h-[76px]
                    w-full

                    md:h-[102px]
                  "
                >
                  <path
                    d="
                      M 0 4
                      C 245 84,
                        755 84,
                        1000 4
                      L 1000 150
                      L 0 150
                      Z
                    "
                    fill="#fffaf5"
                  />

                  <path
                    d="
                      M 0 4
                      C 245 84,
                        755 84,
                        1000 4
                    "
                    fill="none"
                    stroke="#cdb9dc"
                    strokeWidth="4"
                  />
                </svg>
              </div>

              {/* ================================= */}
              {/* CONTEÚDO                         */}
              {/* ================================= */}

              <div
                className="
                  relative
                  flex
                  min-h-0
                  flex-1
                  flex-col
                  items-center
                  bg-[#fffaf5]
                  px-5
                  pb-5
                  pt-[43px]
                  text-center

                  md:px-12
                  md:pb-9
                  md:pt-[58px]
                "
              >
                {/* ================================= */}
                {/* LOTUS                           */}
                {/* ================================= */}

                <div
                  className="
                    absolute
                    left-1/2
                    top-0
                    z-20
                    flex
                    h-[62px]
                    w-[62px]
                    -translate-x-1/2
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-[#d2bfdd]
                    bg-[#fffaf5]
                    text-[#76509a]
                    shadow-[0_5px_18px_rgba(118,80,154,0.12)]

                    md:h-[76px]
                    md:w-[76px]
                    md:shadow-[0_8px_24px_rgba(118,80,154,0.15)]
                  "
                >
                  <svg
                    viewBox="0 0 64 64"
                    fill="none"
                    className="
                      h-[35px]
                      w-[35px]

                      md:h-[43px]
                      md:w-[43px]
                    "
                    aria-hidden="true"
                  >
                    <path
                      d="M32 10C36.5 17.5 37.5 24 32 31.5C26.5 24 27.5 17.5 32 10Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M17 17.5C24.5 19.5 29.5 24 32 31.5C23.5 31.5 18.5 27 17 17.5Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M47 17.5C39.5 19.5 34.5 24 32 31.5C40.5 31.5 45.5 27 47 17.5Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M11 31C20 31 26 34.5 32 40.5C21.5 43.5 14 40.5 11 31Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M53 31C44 31 38 34.5 32 40.5C42.5 43.5 50 40.5 53 31Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M19 45C24 46.5 28.5 46.5 32 43C35.5 46.5 40 46.5 45 45"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* ================================= */}
                {/* TÍTULO                          */}
                {/* ================================= */}

                <h2
                  className="
                    max-w-[380px]
                    shrink-0
                    font-display
                    text-[30px]
                    font-semibold
                    leading-[1.02]
                    tracking-[-0.02em]
                    text-[#633580]

                    md:max-w-[520px]
                    md:text-[43px]
                    md:leading-[1.04]
                  "
                >
                  {procedure.name}
                </h2>

                {/* ================================= */}
                {/* ORNAMENTO                       */}
                {/* ================================= */}

                <div
                  className="
                    mt-3
                    flex
                    shrink-0
                    items-center
                    justify-center
                    gap-2.5

                    md:mt-4
                    md:gap-3
                  "
                >
                  <span
                    className="
                      h-px
                      w-10
                      bg-[#d9cbe3]

                      md:w-14
                    "
                  />

                  <span
                    className="
                      text-[12px]
                      text-[#76509a]

                      md:text-[14px]
                    "
                  >
                    ✦
                  </span>

                  <span
                    className="
                      h-px
                      w-10
                      bg-[#d9cbe3]

                      md:w-14
                    "
                  />
                </div>

                {/* ================================= */}
                {/* DESCRIÇÃO                       */}
                {/* ================================= */}

                <p
                  className="
                    mt-3
                    max-w-[380px]
                    overflow-hidden
                    text-[13px]
                    leading-[1.55]
                    text-[#575359]

                    md:mt-5
                    md:max-w-[520px]
                    md:text-[16px]
                    md:leading-[1.65]
                  "
                >
                  {procedure.description ||
                    procedure.short_description ||
                    "Entre em contato para saber mais sobre este procedimento."}
                </p>

                {/* ================================= */}
                {/* DURAÇÃO                         */}
                {/* ================================= */}

                {procedure.duration_minutes && (
                  <div
                    className="
                      mt-4
                      shrink-0

                      md:mt-6
                    "
                  >
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        bg-[#f2e7f6]
                        px-4
                        py-2
                        text-[12px]
                        font-medium
                        text-[#704093]

                        md:gap-2.5
                        md:px-6
                        md:py-3
                        md:text-[14px]
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="
                          h-4
                          w-4

                          md:h-[18px]
                          md:w-[18px]
                        "
                        aria-hidden="true"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="8"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        />

                        <path
                          d="M12 8V12L14.5 14"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      Aproximadamente{" "}
                      {
                        procedure.duration_minutes
                      }{" "}
                      min
                    </span>
                  </div>
                )}

                {/* ================================= */}
                {/* BOTÃO AGENDAR                   */}
                {/* ================================= */}

                <button
                  type="button"
                  onClick={handleSchedule}
                  className="
                    mt-auto
                    flex
                    min-h-[56px]
                    w-full
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#704093]
                    px-5
                    py-4
                    text-[14px]
                    font-semibold
                    text-white
                    shadow-[0_15px_32px_rgba(86,48,112,0.32)]
                    transition-all
                    duration-300

                    hover:-translate-y-0.5
                    hover:bg-[#5d347b]
                    hover:shadow-[0_19px_38px_rgba(86,48,112,0.36)]

                    active:scale-[0.98]

                    md:min-h-[62px]
                    md:max-w-[470px]
                    md:px-8
                    md:text-[16px]
                  "
                >
                  <span className="flex-1 text-center">
                    Agendar este procedimento
                  </span>

                  <span
                    aria-hidden="true"
                    className="
                      ml-3
                      text-[22px]
                      font-light
                      leading-none

                      md:text-[26px]
                    "
                  >
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {/* ========================================= */}
      {/* CARD NORMAL DO CATÁLOGO                  */}
      {/* ========================================= */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          group
          grid
          h-[155px]
          w-full
          grid-cols-[46%_54%]
          overflow-hidden
          rounded-[12px]
          bg-white
          text-left
          shadow-[0_8px_22px_rgba(52,20,73,0.16)]
          transition
          duration-300

          hover:-translate-y-1
          hover:shadow-[0_12px_28px_rgba(52,20,73,0.25)]

          sm:h-[170px]
          xl:h-[155px]
        "
      >
        {/* FOTO DO CARD */}

        <div
          className="
            relative
            h-full
            w-full
            overflow-hidden
            bg-[#eee4f4]
          "
        >
          {procedure.image_url ? (
            <Image
              src={procedure.image_url}
              alt={procedure.name}
              fill
              sizes="
                (max-width: 640px) 46vw,
                (max-width: 1280px) 23vw,
                170px
              "
              className="
                object-cover
                object-center
                transition-transform
                duration-500

                group-hover:scale-105
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
                px-3
                text-center
                text-xs
                text-[#76509a]/50
              "
            >
              Sem imagem
            </div>
          )}
        </div>

        {/* CONTEÚDO DO CARD */}

        <div
          className="
            flex
            min-w-0
            flex-col
            justify-center
            px-4
            py-3
          "
        >
          <h3
            className="
              line-clamp-2
              font-display
              text-[18px]
              font-semibold
              leading-[1.15]
              text-[#704093]

              sm:text-[19px]
              xl:text-[18px]
            "
          >
            {procedure.name}
          </h3>

          <p
            className="
              mt-2
              line-clamp-3
              text-[12px]
              leading-[1.45]
              text-[#525b68]
            "
          >
            {procedure.short_description ||
              procedure.description ||
              "Conheça mais sobre este procedimento."}
          </p>

          <span
            className="
              mt-auto
              pt-2
              text-[12px]
              font-bold
              text-[#7a489b]
            "
          >
            Ver detalhes
          </span>
        </div>
      </button>

      {modal}
    </>
  );
}