"use client";

import { useState } from "react";
import Image from "next/image";
import type { Procedure } from "@/types/database";

export default function ProcedureCard({
  procedure,
}: {
  procedure: Procedure;
}) {
  const [open, setOpen] = useState(false);

  function handleSchedule() {
    setOpen(false);

    // Envia para o BookingForm qual procedimento foi escolhido
    window.dispatchEvent(
      new CustomEvent("select-procedure-for-booking", {
        detail: procedure,
      })
    );

    // Leva suavemente até o agendamento
    window.setTimeout(() => {
      document
        .getElementById("agendar")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  return (
    <>
      {/* CARD */}
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

      {/* MODAL */}
      {open && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/55
            p-4
            backdrop-blur-sm
          "
          onClick={() => setOpen(false)}
        >
          <div
            className="
              relative
              max-h-[92vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-3xl
              bg-white
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* FECHAR */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                absolute
                right-4
                top-4
                z-20
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-white
                text-2xl
                text-[#704093]
                shadow-md
                transition
                hover:scale-105
              "
              aria-label="Fechar"
            >
              ×
            </button>

            {/* IMAGEM */}
            <div
              className="
                relative
                h-[250px]
                w-full
                overflow-hidden
                bg-[#eee4f4]

                sm:h-[330px]
              "
            >
              {procedure.image_url ? (
                <Image
                  src={procedure.image_url}
                  alt={procedure.name}
                  fill
                  sizes="672px"
                  className="object-cover"
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    items-center
                    justify-center
                    text-[#76509a]/50
                  "
                >
                  Sem imagem
                </div>
              )}
            </div>

            {/* CONTEÚDO */}
            <div
              className="
                p-6
                text-center

                sm:p-8
              "
            >
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-[#76509a]/65
                "
              >
                Procedimento
              </p>

              <h2
                className="
                  mt-2
                  font-display
                  text-2xl
                  font-semibold
                  text-[#704093]

                  sm:text-3xl
                "
              >
                {procedure.name}
              </h2>

              <p
                className="
                  mx-auto
                  mt-4
                  max-w-xl
                  leading-7
                  text-gray-600
                "
              >
                {procedure.description ||
                  procedure.short_description ||
                  "Entre em contato para saber mais sobre este procedimento."}
              </p>

              {procedure.duration_minutes && (
                <div
                  className="
                    mx-auto
                    mt-5
                    inline-flex
                    items-center
                    rounded-full
                    bg-[#f6effa]
                    px-4
                    py-2
                    text-sm
                    text-[#704093]
                  "
                >
                  Aproximadamente{" "}
                  {procedure.duration_minutes} min
                </div>
              )}

              {/* BOTÃO AGENDAR */}
              <button
                type="button"
                onClick={handleSchedule}
                className="
                  mt-7
                  inline-flex
                  min-w-[190px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#76509a]
                  px-9
                  py-3.5
                  font-semibold
                  text-white
                  shadow-[0_10px_25px_rgba(118,80,154,0.22)]
                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:bg-[#56366f]
                  hover:shadow-[0_14px_30px_rgba(118,80,154,0.28)]
                "
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