"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { Procedure } from "@/types/database";

export default function ProcedureCard({
  procedure,
}: {
  procedure: Procedure;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    const previousBody = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      touchAction: body.style.touchAction,
    };

    const previousHtml = {
      overflow: html.style.overflow,
      touchAction: html.style.touchAction,
      overscrollBehavior: html.style.overscrollBehavior,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    html.style.overflow = "hidden";
    html.style.touchAction = "none";
    html.style.overscrollBehavior = "none";

    const preventScroll = (event: Event) => {
      event.preventDefault();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("touchmove", preventScroll, {
      passive: false,
    });

    document.addEventListener("wheel", preventScroll, {
      passive: false,
    });

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("touchmove", preventScroll);
      document.removeEventListener("wheel", preventScroll);
      window.removeEventListener("keydown", handleEscape);

      body.style.position = previousBody.position;
      body.style.top = previousBody.top;
      body.style.left = previousBody.left;
      body.style.right = previousBody.right;
      body.style.width = previousBody.width;
      body.style.overflow = previousBody.overflow;
      body.style.touchAction = previousBody.touchAction;

      html.style.overflow = previousHtml.overflow;
      html.style.touchAction = previousHtml.touchAction;
      html.style.overscrollBehavior =
        previousHtml.overscrollBehavior;

      window.scrollTo(0, scrollY);
    };
  }, [open]);

  function handleSchedule() {
    setOpen(false);

    window.dispatchEvent(
      new CustomEvent("select-procedure-for-booking", {
        detail: procedure,
      })
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

  return (
    <>
      {/* CARD NORMAL DO CATÁLOGO */}
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
        <div className="relative h-full w-full overflow-hidden bg-[#eee4f4]">
          {procedure.image_url ? (
            <Image
              src={procedure.image_url}
              alt={procedure.name}
              fill
              sizes="(max-width: 640px) 46vw, (max-width: 1280px) 23vw, 170px"
              className="
                object-cover
                object-center
                transition-transform
                duration-500
                group-hover:scale-105
              "
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-xs text-[#76509a]/50">
              Sem imagem
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-center px-4 py-3">
          <h3 className="line-clamp-2 font-display text-[18px] font-semibold leading-[1.15] text-[#704093] sm:text-[19px] xl:text-[18px]">
            {procedure.name}
          </h3>

          <p className="mt-2 line-clamp-3 text-[12px] leading-[1.45] text-[#525b68]">
            {procedure.short_description ||
              procedure.description ||
              "Conheça mais sobre este procedimento."}
          </p>

          <span className="mt-auto pt-2 text-[12px] font-bold text-[#7a489b]">
            Ver detalhes
          </span>
        </div>
      </button>

      {/* MODAL PREMIUM */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={procedure.name}
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
            bg-black/55
            p-3
            backdrop-blur-[12px]
            touch-none
            sm:p-6
          "
        >
          <div
            className="
              relative
              flex
              h-[91dvh]
              w-[92vw]
              max-w-[720px]
              flex-col
              overflow-hidden
              rounded-[30px]
              border
              border-white/80
              bg-[#fffaf4]
              shadow-[0_30px_100px_rgba(0,0,0,0.45)]
              sm:h-[90vh]
              sm:max-h-[840px]
              sm:rounded-[34px]
            "
            style={{
              touchAction: "none",
              overscrollBehavior: "none",
            }}
          >
            {/* X */}
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
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-white/90
                bg-[#fffaf4]/95
                text-[30px]
                font-light
                leading-none
                text-[#674285]
                shadow-[0_8px_24px_rgba(0,0,0,0.18)]
                backdrop-blur-md
                transition
                active:scale-95
              "
              style={{
                touchAction: "manipulation",
              }}
            >
              ×
            </button>

            {/* FOTO */}
            <div className="relative h-[47%] w-full shrink-0 overflow-hidden bg-[#eee4f4]">
              {procedure.image_url ? (
                <Image
                  src={procedure.image_url}
                  alt={procedure.name}
                  fill
                  sizes="(max-width: 640px) 92vw, 720px"
                  className="object-cover object-center"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#76509a]/50">
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
                  h-20
                  bg-gradient-to-t
                  from-black/15
                  to-transparent
                "
              />
            </div>

            {/* CONTEÚDO CURVO */}
            <div
              className="
                relative
                -mt-8
                flex
                min-h-0
                flex-1
                flex-col
                items-center
                overflow-hidden
                bg-[#fffaf4]
                px-5
                pb-5
                pt-12
                text-center
                sm:-mt-10
                sm:px-8
                sm:pb-7
                sm:pt-14
              "
              style={{
                borderRadius: "50% 50% 0 0 / 38px 38px 0 0",
              }}
            >
              {/* ÍCONE CENTRAL */}
              <div
                className="
                  absolute
                  left-1/2
                  top-0
                  flex
                  h-16
                  w-16
                  -translate-x-1/2
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-[#cdb9dc]
                  bg-[#fffaf4]
                  text-[#76509a]
                  shadow-sm
                "
              >
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  className="h-9 w-9"
                  aria-hidden="true"
                >
                  <path
                    d="M32 11C36 18 37 24 32 31C27 24 28 18 32 11Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18 18C25 20 30 24 32 31C24 31 19 27 18 18Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M46 18C39 20 34 24 32 31C40 31 45 27 46 18Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 31C20 31 26 34 32 40C22 43 15 40 12 31Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M52 31C44 31 38 34 32 40C42 43 49 40 52 31Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2
                className="
                  mt-1
                  line-clamp-2
                  shrink-0
                  font-display
                  text-[30px]
                  font-semibold
                  leading-[1.02]
                  text-[#684086]
                  sm:text-[40px]
                "
              >
                {procedure.name}
              </h2>

              {/* ORNAMENTO */}
              <div className="mt-3 flex shrink-0 items-center gap-2">
                <span className="h-px w-10 bg-[#d9cbe3]" />
                <span className="text-xs text-[#76509a]">✦</span>
                <span className="h-px w-10 bg-[#d9cbe3]" />
              </div>

              {/* DESCRIÇÃO */}
              <p
                className="
                  mt-3
                  line-clamp-5
                  max-w-[590px]
                  overflow-hidden
                  text-[13px]
                  leading-5
                  text-[#5d5960]
                  sm:mt-4
                  sm:text-[15px]
                  sm:leading-6
                "
              >
                {procedure.description ||
                  procedure.short_description ||
                  "Entre em contato para saber mais sobre este procedimento."}
              </p>

              {/* DURAÇÃO */}
              {procedure.duration_minutes && (
                <div className="mt-3 shrink-0 sm:mt-4">
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-[#f3ebf8]
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

                    Aproximadamente {procedure.duration_minutes} min
                  </span>
                </div>
              )}

              {/* BOTÃO AGENDAR */}
              <button
                type="button"
                onClick={handleSchedule}
                className="
                  mt-auto
                  flex
                  min-h-[54px]
                  w-full
                  shrink-0
                  items-center
                  justify-between
                  rounded-full
                  bg-gradient-to-r
                  from-[#69418a]
                  via-[#76509a]
                  to-[#7d4aa0]
                  px-7
                  py-4
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_14px_30px_rgba(118,80,154,0.30)]
                  transition
                  active:scale-[0.98]
                  sm:w-auto
                  sm:min-w-[360px]
                "
                style={{
                  touchAction: "manipulation",
                }}
              >
                <span className="flex-1 text-center">
                  Agendar este procedimento
                </span>

                <span className="ml-4 text-xl leading-none">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}