"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { Procedure } from "@/types/database";

export default function ProcedureCard({
  procedure,
}: {
  procedure: Procedure;
}) {
  const [open, setOpen] =
    useState(false);

  /*
   * TRAVA A TELA DE FUNDO
   *
   * Quando o modal abre:
   * - a página atrás para de rolar
   * - o foco visual fica somente no procedimento
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    /*
     * TRAVA REAL DO FUNDO
     *
     * Usar somente overflow:hidden nem sempre trava
     * completamente o Safari/iPhone.
     *
     * Aqui guardamos a posição atual da página,
     * fixamos o body e restauramos exatamente o mesmo
     * ponto quando o modal fecha.
     */
    const scrollY =
      window.scrollY;

    const body =
      document.body;

    const html =
      document.documentElement;

    const previousBodyStyle = {
      position:
        body.style.position,
      top:
        body.style.top,
      left:
        body.style.left,
      right:
        body.style.right,
      width:
        body.style.width,
      overflow:
        body.style.overflow,
    };

    const previousHtmlOverflow =
      html.style.overflow;

    body.style.position =
      "fixed";

    body.style.top =
      `-${scrollY}px`;

    body.style.left =
      "0";

    body.style.right =
      "0";

    body.style.width =
      "100%";

    body.style.overflow =
      "hidden";

    html.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      body.style.position =
        previousBodyStyle.position;

      body.style.top =
        previousBodyStyle.top;

      body.style.left =
        previousBodyStyle.left;

      body.style.right =
        previousBodyStyle.right;

      body.style.width =
        previousBodyStyle.width;

      body.style.overflow =
        previousBodyStyle.overflow;

      html.style.overflow =
        previousHtmlOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );

      window.scrollTo(
        0,
        scrollY
      );
    };
  }, [open]);

  function handleSchedule() {
    setOpen(false);

    /*
     * ENVIA PARA O BOOKINGFORM
     * O PROCEDIMENTO QUE FOI CLICADO
     */
    window.dispatchEvent(
      new CustomEvent(
        "select-procedure-for-booking",
        {
          detail: procedure,
        }
      )
    );

    /*
     * ESPERA O MODAL FECHAR
     * E VAI PARA O AGENDAMENTO
     */
    window.setTimeout(() => {
      document
        .getElementById("agendar")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 150);
  }

  return (
    <>
      {/* ================================================= */}
      {/* CARD DO CATÁLOGO                                  */}
      {/* ================================================= */}

      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
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
        {/* IMAGEM DO CARD */}
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
              src={
                procedure.image_url
              }
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
                bg-[#eee4f4]
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

        {/* TEXTO DO CARD */}
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

      {/* ================================================= */}
      {/* MODAL DO PROCEDIMENTO                             */}
      {/* ================================================= */}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            procedure.name
          }
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/65
            p-3
            backdrop-blur-[10px]
            overscroll-none
            touch-none

            sm:p-6
          "
          onMouseDown={() =>
            setOpen(false)
          }
        >
          {/* ============================================= */}
          {/* CONTAINER DO MODAL                            */}
          {/* ============================================= */}

          <div
            className="
              relative
              flex
              h-[90dvh]
              max-h-[760px]
              w-[96vw]
              max-w-[720px]
              flex-col
              overflow-hidden
              rounded-[26px]
              bg-white
              shadow-[0_30px_100px_rgba(0,0,0,0.45)]

              sm:max-h-[92vh]
              sm:rounded-[30px]
            "
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            {/* ============================================= */}
            {/* BOTÃO FECHAR                                  */}
            {/* ============================================= */}

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              aria-label="Fechar procedimento"
              className="
                absolute
                right-3
                top-3
                z-30
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-white/70
                bg-white/95
                text-[26px]
                font-light
                leading-none
                text-[#704093]
                shadow-[0_8px_24px_rgba(0,0,0,0.20)]
                backdrop-blur-md
                transition

                hover:scale-105
                hover:bg-white

                sm:right-4
                sm:top-4
              "
            >
              ×
            </button>

            {/* ============================================= */}
            {/* ÁREA QUE PODE ROLAR                           */}
            {/* ============================================= */}

            <div
              className="
                h-full
                overflow-y-auto
                overscroll-contain
                touch-pan-y

                [&::-webkit-scrollbar]:w-1.5

                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-[#76509a]/25

                [&::-webkit-scrollbar-track]:bg-transparent
              "
            >
              {/* =========================================== */}
              {/* IMAGEM GRANDE                              */}
              {/* =========================================== */}

              <div
                className="
                  relative
                  h-[42dvh]
                  min-h-[280px]
                  max-h-[420px]
                  w-full
                  overflow-hidden
                  bg-[#eee4f4]

                  sm:h-[420px]
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
                    priority={false}
                    sizes="
                      (max-width: 640px) 100vw,
                      680px
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
                      bg-[#eee4f4]
                      text-sm
                      text-[#76509a]/50
                    "
                  >
                    Sem imagem
                  </div>
                )}

                {/* SOMBRA SUAVE NA BASE DA FOTO */}
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    bottom-0
                    h-20
                    bg-gradient-to-t
                    from-black/20
                    to-transparent
                  "
                />
              </div>

              {/* =========================================== */}
              {/* CONTEÚDO                                   */}
              {/* =========================================== */}

              <div
                className="
                  px-5
                  pb-6
                  pt-6
                  text-center

                  sm:px-8
                  sm:pb-8
                  sm:pt-7
                "
              >
                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.28em]
                    text-[#76509a]/70

                    sm:text-xs
                  "
                >
                  Procedimento
                </p>

                <h2
                  className="
                    mx-auto
                    mt-3
                    max-w-[560px]
                    font-display
                    text-[29px]
                    font-semibold
                    leading-[1.08]
                    text-[#704093]

                    sm:text-[38px]
                  "
                >
                  {procedure.name}
                </h2>

                <div
                  className="
                    mx-auto
                    mt-4
                    h-px
                    w-14
                    bg-[#76509a]/25
                  "
                />

                <p
                  className="
                    mx-auto
                    mt-5
                    max-w-[560px]
                    text-[14px]
                    leading-7
                    text-[#5e5b5e]

                    sm:text-[15px]
                  "
                >
                  {procedure.description ||
                    procedure.short_description ||
                    "Entre em contato para saber mais sobre este procedimento."}
                </p>

                {/* DURAÇÃO */}
                {procedure.duration_minutes && (
                  <div
                    className="
                      mt-5
                      flex
                      justify-center
                    "
                  >
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        bg-[#f5eef9]
                        px-4
                        py-2
                        text-[13px]
                        font-medium
                        text-[#704093]
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4"
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

                {/* ========================================= */}
                {/* BOTÃO AGENDAR                            */}
                {/* ========================================= */}

                <button
                  type="button"
                  onClick={
                    handleSchedule
                  }
                  className="
                    mt-7
                    inline-flex
                    min-h-[52px]
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    bg-[#76509a]
                    px-8
                    py-4
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_12px_28px_rgba(118,80,154,0.28)]
                    transition-all
                    duration-300

                    hover:-translate-y-0.5
                    hover:bg-[#56366f]
                    hover:shadow-[0_16px_34px_rgba(118,80,154,0.32)]

                    sm:w-auto
                    sm:min-w-[300px]
                  "
                >
                  Agendar este procedimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
    
  );
}