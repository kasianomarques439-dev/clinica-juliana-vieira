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

  useEffect(() => {
    if (!open) {
      return;
    }

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
      height:
        body.style.height,
      overflow:
        body.style.overflow,
      touchAction:
        body.style.touchAction,
    };

    const previousHtmlStyle = {
      overflow:
        html.style.overflow,
      height:
        html.style.height,
      touchAction:
        html.style.touchAction,
      overscrollBehavior:
        html.style.overscrollBehavior,
    };

    /*
     * TRAVA TOTAL DA PÁGINA
     */
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

    body.style.height =
      "100%";

    body.style.overflow =
      "hidden";

    body.style.touchAction =
      "none";

    html.style.overflow =
      "hidden";

    html.style.height =
      "100%";

    html.style.touchAction =
      "none";

    html.style.overscrollBehavior =
      "none";

    /*
     * BLOQUEIA O GESTO DO DEDO
     * E A RODA DO MOUSE.
     *
     * Isso impede o "puxar para cima/baixo"
     * do Safari/Chrome enquanto o modal está aberto.
     */
    const preventScroll = (
      event: Event
    ) => {
      event.preventDefault();
    };

    document.addEventListener(
      "touchmove",
      preventScroll,
      {
        passive: false,
      }
    );

    document.addEventListener(
      "wheel",
      preventScroll,
      {
        passive: false,
      }
    );

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
      document.removeEventListener(
        "touchmove",
        preventScroll
      );

      document.removeEventListener(
        "wheel",
        preventScroll
      );

      window.removeEventListener(
        "keydown",
        handleEscape
      );

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

      body.style.height =
        previousBodyStyle.height;

      body.style.overflow =
        previousBodyStyle.overflow;

      body.style.touchAction =
        previousBodyStyle.touchAction;

      html.style.overflow =
        previousHtmlStyle.overflow;

      html.style.height =
        previousHtmlStyle.height;

      html.style.touchAction =
        previousHtmlStyle.touchAction;

      html.style.overscrollBehavior =
        previousHtmlStyle.overscrollBehavior;

      window.scrollTo(
        0,
        scrollY
      );
    };
  }, [open]);

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
        .getElementById(
          "agendar"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 180);
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
      {/* MODAL TOTALMENTE FIXO                             */}
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
            z-[99999]
            flex
            h-[100dvh]
            w-screen
            items-center
            justify-center
            overflow-hidden
            overscroll-none
            bg-black/65
            p-3
            backdrop-blur-[14px]
            touch-none
            sm:p-6
          "
        >
          <div
            className="
              relative
              flex
              h-[91dvh]
              w-[94vw]
              max-w-[720px]
              flex-col
              overflow-hidden
              rounded-[28px]
              bg-white
              shadow-[0_30px_100px_rgba(0,0,0,0.50)]
              sm:h-[90vh]
              sm:max-h-[820px]
              sm:rounded-[32px]
            "
            style={{
              touchAction:
                "none",
              overscrollBehavior:
                "none",
            }}
          >
            {/* ÚNICA FORMA DE FECHAR VISUALMENTE */}
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
                z-50
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-white/80
                bg-white
                text-[30px]
                font-light
                leading-none
                text-[#704093]
                shadow-[0_8px_24px_rgba(0,0,0,0.24)]
                transition
                active:scale-95
                sm:right-4
                sm:top-4
              "
              style={{
                touchAction:
                  "manipulation",
              }}
            >
              ×
            </button>

            {/* FOTO FIXA */}
            <div
              className="
                relative
                h-[44%]
                min-h-0
                w-full
                flex-none
                overflow-hidden
                bg-[#eee4f4]
                sm:h-[48%]
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
                    (max-width: 640px) 94vw,
                    720px
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
                    text-sm
                    text-[#76509a]/50
                  "
                >
                  Sem imagem
                </div>
              )}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  bottom-0
                  h-16
                  bg-gradient-to-t
                  from-black/20
                  to-transparent
                "
              />
            </div>

            {/* CONTEÚDO FIXO - SEM ROLAGEM */}
            <div
              className="
                flex
                min-h-0
                flex-1
                flex-col
                items-center
                overflow-hidden
                px-5
                pb-5
                pt-5
                text-center
                sm:px-8
                sm:pb-7
                sm:pt-6
              "
            >
              <p
                className="
                  shrink-0
                  text-[10px]
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
                  mt-2
                  line-clamp-2
                  shrink-0
                  font-display
                  text-[26px]
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
                  mt-3
                  h-px
                  w-14
                  shrink-0
                  bg-[#76509a]/25
                "
              />

              <p
                className="
                  mt-3
                  line-clamp-4
                  max-w-[580px]
                  overflow-hidden
                  text-[13px]
                  leading-5
                  text-[#5e5b5e]
                  sm:mt-4
                  sm:line-clamp-5
                  sm:text-[15px]
                  sm:leading-6
                "
              >
                {procedure.description ||
                  procedure.short_description ||
                  "Entre em contato para saber mais sobre este procedimento."}
              </p>

              {procedure.duration_minutes && (
                <div
                  className="
                    mt-3
                    shrink-0
                    sm:mt-4
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
                      text-[12px]
                      font-medium
                      text-[#704093]
                      sm:text-[13px]
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

              <button
                type="button"
                onClick={
                  handleSchedule
                }
                className="
                  mt-auto
                  flex
                  min-h-[50px]
                  w-full
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#76509a]
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_12px_28px_rgba(118,80,154,0.28)]
                  transition
                  active:scale-[0.98]
                  sm:w-auto
                  sm:min-w-[320px]
                "
                style={{
                  touchAction:
                    "manipulation",
                }}
              >
                Agendar este procedimento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}