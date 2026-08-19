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
   * GARANTE QUE O PORTAL SÓ SEJA
   * CRIADO DEPOIS QUE O COMPONENTE
   * ESTIVER NO NAVEGADOR.
   */
  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /*
   * TRAVA COMPLETAMENTE O FUNDO
   * ENQUANTO O MODAL ESTIVER ABERTO.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const scrollY = window.scrollY;

    const body = document.body;
    const html = document.documentElement;

    const previousBodyPosition =
      body.style.position;

    const previousBodyTop =
      body.style.top;

    const previousBodyLeft =
      body.style.left;

    const previousBodyRight =
      body.style.right;

    const previousBodyWidth =
      body.style.width;

    const previousBodyOverflow =
      body.style.overflow;

    const previousHtmlOverflow =
      html.style.overflow;

    const previousOverscroll =
      html.style.overscrollBehavior;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      body.style.position =
        previousBodyPosition;

      body.style.top =
        previousBodyTop;

      body.style.left =
        previousBodyLeft;

      body.style.right =
        previousBodyRight;

      body.style.width =
        previousBodyWidth;

      body.style.overflow =
        previousBodyOverflow;

      html.style.overflow =
        previousHtmlOverflow;

      html.style.overscrollBehavior =
        previousOverscroll;

      window.scrollTo(0, scrollY);
    };
  }, [open]);

  /*
   * FECHA O MODAL,
   * SELECIONA O PROCEDIMENTO
   * NO BOOKINGFORM
   * E ROLA ATÉ #AGENDAR.
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
    }, 180);
  }

  /*
   * MODAL PREMIUM
   *
   * IMPORTANTE:
   * createPortal coloca o modal diretamente
   * no document.body.
   *
   * Assim ele NÃO sofre interferência de:
   * - carousel
   * - transform
   * - overflow
   * - stacking context
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
              fixed
              inset-0
              z-[999999]
              flex
              h-[100dvh]
              w-screen
              items-center
              justify-center
              overflow-hidden

              bg-black/60
              backdrop-blur-[8px]

              px-[15px]
              py-[14px]

              sm:px-6
              sm:py-6
            "
          >
            {/* ========================================= */}
            {/* CORPO DO MODAL                           */}
            {/* ========================================= */}

            <div
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
              className="
                relative
                flex

                h-[88dvh]
                max-h-[780px]

                w-[88vw]
                max-w-[430px]

                flex-col
                overflow-hidden

                rounded-[30px]

                border
                border-white/80

                bg-[#fffaf5]

                shadow-[0_30px_90px_rgba(0,0,0,0.48)]

                sm:h-[90dvh]
                sm:max-h-[850px]
                sm:w-[86vw]
                sm:max-w-[560px]
                sm:rounded-[36px]
              "
            >
              {/* ========================================= */}
              {/* BOTÃO X                                  */}
              {/* ========================================= */}

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                aria-label="Fechar procedimento"
                className="
                  absolute
                  right-[14px]
                  top-[14px]
                  z-50

                  flex
                  h-[46px]
                  w-[46px]
                  items-center
                  justify-center

                  rounded-full

                  border
                  border-white/80

                  bg-[#fffaf5]/95

                  text-[28px]
                  font-light
                  leading-none
                  text-[#704093]

                  shadow-[0_6px_20px_rgba(0,0,0,0.18)]

                  backdrop-blur-md

                  transition-all
                  duration-200

                  hover:scale-105

                  active:scale-95

                  sm:right-5
                  sm:top-5
                  sm:h-[50px]
                  sm:w-[50px]
                  sm:text-[30px]
                "
              >
                ×
              </button>

              {/* ========================================= */}
              {/* FOTO                                     */}
              {/* ========================================= */}

              <div
                className="
                  relative

                  h-[44%]
                  w-full
                  shrink-0

                  overflow-hidden

                  bg-[#eee4f4]

                  sm:h-[46%]
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
                    priority
                    sizes="
                      (max-width: 640px) 88vw,
                      560px
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
                      px-5
                      text-center
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
                    h-[80px]

                    bg-gradient-to-t
                    from-black/15
                    via-black/[0.04]
                    to-transparent
                  "
                />
              </div>

              {/* ========================================= */}
              {/* ÁREA BRANCA CURVA                        */}
              {/* ========================================= */}

              <div
                className="
                  relative

                  -mt-[31px]

                  flex
                  min-h-0
                  flex-1
                  flex-col

                  items-center

                  bg-[#fffaf5]

                  px-[22px]
                  pb-[19px]
                  pt-[48px]

                  text-center

                  sm:-mt-[38px]
                  sm:px-10
                  sm:pb-7
                  sm:pt-[58px]
                "
                style={{
                  borderRadius:
                    "50% 50% 0 0 / 34px 34px 0 0",

                  borderTop:
                    "2px solid #d8c4e3",
                }}
              >
                {/* ========================================= */}
                {/* LOTUS                                    */}
                {/* ========================================= */}

                <div
                  className="
                    absolute
                    left-1/2
                    top-0
                    z-20

                    flex

                    h-[61px]
                    w-[61px]

                    -translate-x-1/2
                    -translate-y-1/2

                    items-center
                    justify-center

                    rounded-full

                    border-2
                    border-[#d2bfdc]

                    bg-[#fffaf5]

                    text-[#76509a]

                    shadow-[0_5px_16px_rgba(84,47,108,0.10)]

                    sm:h-[70px]
                    sm:w-[70px]
                  "
                >
                  <svg
                    viewBox="0 0 64 64"
                    fill="none"
                    className="
                      h-[34px]
                      w-[34px]

                      sm:h-[39px]
                      sm:w-[39px]
                    "
                    aria-hidden="true"
                  >
                    <path
                      d="
                        M32 10
                        C36.5 17.5 37.5 24 32 31.5
                        C26.5 24 27.5 17.5 32 10Z
                      "
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    <path
                      d="
                        M17 17.5
                        C24.5 19.5 29.5 24 32 31.5
                        C23.5 31.5 18.5 27 17 17.5Z
                      "
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    <path
                      d="
                        M47 17.5
                        C39.5 19.5 34.5 24 32 31.5
                        C40.5 31.5 45.5 27 47 17.5Z
                      "
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    <path
                      d="
                        M11 31
                        C20 31 26 34.5 32 40.5
                        C21.5 43.5 14 40.5 11 31Z
                      "
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    <path
                      d="
                        M53 31
                        C44 31 38 34.5 32 40.5
                        C42.5 43.5 50 40.5 53 31Z
                      "
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    <path
                      d="
                        M19 45
                        C24 46.5 28.5 46.5 32 43
                        C35.5 46.5 40 46.5 45 45
                      "
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* ========================================= */}
                {/* TÍTULO                                   */}
                {/* ========================================= */}

                <h2
                  className="
                    max-w-[350px]

                    shrink-0

                    font-display

                    text-[29px]
                    font-semibold

                    leading-[1.03]

                    tracking-[-0.02em]

                    text-[#704093]

                    sm:max-w-[470px]
                    sm:text-[40px]
                    sm:leading-[1.02]
                  "
                >
                  {procedure.name}
                </h2>

                {/* ========================================= */}
                {/* ORNAMENTO                                */}
                {/* ========================================= */}

                <div
                  className="
                    mt-[13px]

                    flex
                    shrink-0
                    items-center
                    justify-center

                    gap-[9px]

                    sm:mt-4
                  "
                >
                  <span
                    className="
                      h-px
                      w-[39px]

                      bg-gradient-to-r
                      from-transparent
                      to-[#d0bddc]
                    "
                  />

                  <span
                    className="
                      text-[11px]
                      text-[#76509a]
                    "
                  >
                    ✦
                  </span>

                  <span
                    className="
                      h-px
                      w-[39px]

                      bg-gradient-to-l
                      from-transparent
                      to-[#d0bddc]
                    "
                  />
                </div>

                {/* ========================================= */}
                {/* DESCRIÇÃO                                */}
                {/* ========================================= */}

                <p
                  className="
                    mt-[13px]

                    max-w-[355px]

                    text-[13px]

                    leading-[1.55]

                    text-[#57535a]

                    sm:mt-4
                    sm:max-w-[475px]
                    sm:text-[15px]
                    sm:leading-[1.6]
                  "
                >
                  {procedure.description ||
                    procedure.short_description ||
                    "Entre em contato para saber mais sobre este procedimento."}
                </p>

                {/* ========================================= */}
                {/* DURAÇÃO                                  */}
                {/* ========================================= */}

                {procedure.duration_minutes && (
                  <div
                    className="
                      mt-[14px]
                      shrink-0

                      sm:mt-5
                    "
                  >
                    <span
                      className="
                        inline-flex

                        items-center

                        gap-2

                        rounded-full

                        bg-[#f2e8f7]

                        px-[17px]
                        py-[9px]

                        text-[12px]
                        font-medium

                        text-[#704093]

                        sm:px-5
                        sm:py-[10px]
                        sm:text-[13px]
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="
                          h-[17px]
                          w-[17px]
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

                {/* ========================================= */}
                {/* BOTÃO AGENDAR                           */}
                {/* ========================================= */}

                <button
                  type="button"
                  onClick={
                    handleSchedule
                  }
                  className="
                    mt-auto

                    flex

                    min-h-[55px]
                    w-full

                    shrink-0

                    items-center
                    justify-center

                    rounded-full

                    bg-gradient-to-r

                    from-[#704092]
                    via-[#76509a]
                    to-[#704092]

                    px-5
                    py-[15px]

                    text-[13px]
                    font-semibold

                    text-white

                    shadow-[0_13px_29px_rgba(88,51,112,0.30)]

                    transition-all
                    duration-300

                    hover:-translate-y-[1px]

                    hover:shadow-[0_16px_34px_rgba(88,51,112,0.35)]

                    active:scale-[0.98]

                    sm:min-h-[60px]
                    sm:max-w-[470px]
                    sm:px-8
                    sm:text-[16px]
                  "
                >
                  <span
                    className="
                      flex-1
                      text-center
                    "
                  >
                    Agendar este procedimento
                  </span>

                  <span
                    aria-hidden="true"
                    className="
                      ml-3
                      text-[22px]
                      font-light
                      leading-none

                      sm:text-[25px]
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
      {/* CARD NORMAL DO CATÁLOGO                 */}
      {/* ========================================= */}

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
              alt={
                procedure.name
              }
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

      {/* MODAL FORA DO CARROSSEL */}

      {modal}
    </>
  );
}