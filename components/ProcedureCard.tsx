"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

import type { Procedure } from "@/types/database";

type SavedScrollStyles = {
  bodyOverflow: string;
  bodyOverscrollBehavior: string;
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
};

export default function ProcedureCard({
  procedure,
}: {
  procedure: Procedure;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const savedScrollStyles =
    useRef<SavedScrollStyles | null>(null);

  /*
   * GARANTE QUE O PORTAL SÓ EXISTA
   * NO NAVEGADOR
   */
  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /*
   * LIBERA A ROLAGEM DA PÁGINA.
   *
   * ESSA FUNÇÃO É USADA TANTO AO
   * FECHAR O MODAL QUANTO ANTES
   * DE ROLAR PARA O AGENDAMENTO.
   */
  function restorePageScroll() {
    const saved = savedScrollStyles.current;

    if (!saved) {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior =
        "";

      document.documentElement.style.overflow =
        "";
      document.documentElement.style.overscrollBehavior =
        "";

      return;
    }

    document.body.style.overflow =
      saved.bodyOverflow;

    document.body.style.overscrollBehavior =
      saved.bodyOverscrollBehavior;

    document.documentElement.style.overflow =
      saved.htmlOverflow;

    document.documentElement.style.overscrollBehavior =
      saved.htmlOverscrollBehavior;

    savedScrollStyles.current = null;
  }

  /*
   * TRAVA O SITE ENQUANTO
   * O MODAL ESTIVER ABERTO
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const body = document.body;
    const html = document.documentElement;

    savedScrollStyles.current = {
      bodyOverflow: body.style.overflow,
      bodyOverscrollBehavior:
        body.style.overscrollBehavior,
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior:
        html.style.overscrollBehavior,
    };

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

      restorePageScroll();
    };
  }, [open]);

  /*
   * FECHAR O MODAL
   */
  function handleClose() {
    restorePageScroll();
    setOpen(false);
  }

  /*
   * AGENDAR PROCEDIMENTO
   *
   * PRIMEIRO:
   * - libera o scroll
   * - fecha o modal
   * - seleciona o procedimento
   *
   * DEPOIS:
   * - rola até #agendar
   */
  function handleSchedule() {
    restorePageScroll();

    setOpen(false);

    window.dispatchEvent(
      new CustomEvent(
        "select-procedure-for-booking",
        {
          detail: procedure,
        }
      )
    );

    /*
     * DOIS FRAMES GARANTEM QUE
     * O MODAL JÁ SUMIU E O BODY
     * JÁ ESTÁ LIBERADO.
     */
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          const bookingSection =
            document.getElementById(
              "agendar"
            );

          if (!bookingSection) {
            return;
          }

          bookingSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 80);
      });
    });
  }

  /*
   * MODAL PREMIUM
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
                handleClose();
              }
            }}
            className="
              fixed
              inset-0
              z-[2147483647]

              flex
              h-[100dvh]
              w-screen

              items-center
              justify-center

              overflow-y-auto

              bg-black/60

              px-3
              py-3

              backdrop-blur-[10px]

              md:px-6
              md:py-5
            "
            style={{
              isolation: "isolate",
              WebkitOverflowScrolling:
                "touch",
            }}
          >
            {/* ================================= */}
            {/* CARD PREMIUM                     */}
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

                h-[calc(100dvh-26px)]
                max-h-[820px]

                md:h-auto
                md:max-h-[calc(100dvh-40px)]
                md:max-w-[500px]
                md:rounded-[32px]

                lg:max-w-[520px]
              "
            >
              {/* ================================= */}
              {/* BOTÃO FECHAR                    */}
              {/* ================================= */}

              <button
                type="button"
                onClick={handleClose}
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

                  md:right-5
                  md:top-5
                  md:h-[48px]
                  md:w-[48px]
                "
              >
                ×
              </button>

              {/* ================================= */}
              {/* FOTO                            */}
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

                  md:h-[225px]
                  md:min-h-[225px]

                  lg:h-[240px]
                  lg:min-h-[240px]
                "
              >
                {procedure.image_url ? (
                  <>
                    {/*
                     * FUNDO DESFOCADO.
                     *
                     * NO DESKTOP ELE PREENCHE
                     * AS SOBRAS SEM CORTAR
                     * A FOTO PRINCIPAL.
                     */}
                    <div
                      className="
                        absolute
                        inset-0
                        hidden

                        md:block
                      "
                    >
                      <Image
                        src={
                          procedure.image_url
                        }
                        alt=""
                        fill
                        aria-hidden="true"
                        sizes="520px"
                        className="
                          scale-110
                          object-cover
                          object-center

                          blur-[18px]
                        "
                      />

                      <div
                        className="
                          absolute
                          inset-0
                          bg-black/10
                        "
                      />
                    </div>

                    {/*
                     * FOTO PRINCIPAL
                     *
                     * MOBILE:
                     * mantém object-cover,
                     * como já estava aprovado.
                     *
                     * DESKTOP:
                     * object-contain mostra
                     * a imagem inteira.
                     */}
                    <Image
                      src={
                        procedure.image_url
                      }
                      alt={procedure.name}
                      fill
                      priority
                      sizes="
                        (max-width: 767px) 100vw,
                        520px
                      "
                      className="
                        relative
                        z-[2]

                        object-cover
                        object-center

                        md:object-contain
                      "
                    />
                  </>
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

                {/* SOMBRA DA FOTO */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none

                    absolute
                    inset-x-0
                    bottom-0
                    z-[3]

                    h-28

                    bg-gradient-to-t
                    from-black/15
                    via-black/5
                    to-transparent

                    md:h-16
                  "
                />

                {/* ================================= */}
                {/* CURVA                           */}
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

                    md:h-[70px]
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
              {/* CONTEÚDO                        */}
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

                  md:px-8
                  md:pb-6
                  md:pt-[36px]
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

                    md:h-[60px]
                    md:w-[60px]
                  "
                >
                  <svg
                    viewBox="0 0 64 64"
                    fill="none"
                    className="
                      h-[35px]
                      w-[35px]

                      md:h-[32px]
                      md:w-[32px]
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

                    md:max-w-[430px]
                    md:text-[31px]
                    md:leading-[1.03]
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
                  "
                >
                  <span
                    className="
                      h-px
                      w-10
                      bg-[#d9cbe3]
                    "
                  />

                  <span
                    className="
                      text-[12px]
                      text-[#76509a]
                    "
                  >
                    ✦
                  </span>

                  <span
                    className="
                      h-px
                      w-10
                      bg-[#d9cbe3]
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

                    text-[13px]
                    leading-[1.55]

                    text-[#575359]

                    md:mt-3
                    md:max-w-[430px]
                    md:text-[13px]
                    md:leading-[1.5]
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

                      md:mt-4
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

                        md:px-5
                        md:py-2
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

                    active:scale-[0.98]

                    md:mt-5
                    md:min-h-[52px]
                    md:max-w-[430px]
                    md:px-6
                    md:py-3
                    md:text-[14px]
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
        {/* IMAGEM */}

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

        {/* TEXTO */}

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