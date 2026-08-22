import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-[#fbf7f2]"
    >
      {/* ===================================================== */}
      {/* MOBILE                                                */}
      {/* ===================================================== */}

      <div className="relative pt-[94px] lg:hidden">
        <div
          className="
            relative
            min-h-[405px]
            overflow-hidden
            border-b
            border-[#76509a]/10
            bg-gradient-to-br
            from-[#fbf5f1]
            via-[#faf1f5]
            to-[#ead8e9]
          "
        >
          {/* brilho de fundo */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-16
              -top-10
              h-72
              w-72
              rounded-full
              bg-[#cfaee0]/30
              blur-3xl
            "
          />

          {/* FOTO */}
          <div
            className="
              absolute
              bottom-0
              right-[-35px]
              top-0
              w-[58%]
            "
          >
            <Image
              src="/images/procedimentos/botox.png"
              alt="Procedimento estético"
              fill
              priority
              sizes="58vw"
              className="
                object-cover
                object-center
              "
            />

            {/* integração da foto com o fundo */}
            <div
              aria-hidden="true"
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-[#fbf5f1]
                via-[#fbf5f1]/10
                to-transparent
              "
            />

            <div
              aria-hidden="true"
              className="
                absolute
                inset-x-0
                bottom-0
                h-24
                bg-gradient-to-t
                from-[#fbf5f1]
                to-transparent
              "
            />
          </div>

          {/* TEXTO */}
          <div
            className="
              relative
              z-10
              flex
              min-h-[405px]
              w-[59%]
              flex-col
              justify-center
              px-5
              pb-5
              pt-8
            "
          >
            <p
              className="
                mb-3
                text-[9px]
                font-bold
                uppercase
                tracking-[0.19em]
                text-[#76509a]
              "
            >
              Realce sua melhor versão
            </p>

            <h1
              className="
                font-display
                text-[32px]
                font-semibold
                leading-[1.02]
                tracking-[-0.025em]
                text-[#4f2d60]
              "
            >
              Beleza que
              <br />
              transforma,
              <br />
              confiança que
              <br />
              permanece.
            </h1>

            <p
              className="
                mt-4
                max-w-[205px]
                text-[11px]
                font-medium
                leading-[1.65]
                text-[#5f5860]
              "
            >
              Procedimentos estéticos seguros e
              personalizados para realçar sua beleza
              natural com harmonia e resultados que
              valorizam você.
            </p>

            <a
              href="#agendar"
              className="
                mt-5
                inline-flex
                min-h-[44px]
                w-fit
                items-center
                justify-center
                gap-2
                rounded-[8px]
                bg-[#704093]
                px-4
                text-[11px]
                font-bold
                text-white
                shadow-[0_10px_24px_rgba(90,52,116,0.22)]
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="6"
                  width="16"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M8 3V8M16 3V8M4 10H20"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>

              Agende seu horário
            </a>

            <div
              className="
                mt-4
                flex
                max-w-[190px]
                items-start
                gap-2
              "
            >
              <div
                className="
                  mt-[1px]
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#76509a]/25
                  text-[#76509a]
                "
              >
                <span className="text-[9px]">✦</span>
              </div>

              <p
                className="
                  text-[9px]
                  font-medium
                  leading-[1.5]
                  text-[#5c565d]
                "
              >
                Atendimento humanizado
                <br />
                e personalizado
              </p>
            </div>
          </div>

          {/* SELO JV */}
          <div
            aria-hidden="true"
            className="
              absolute
              bottom-5
              right-12
              z-20
              flex
              h-[62px]
              w-[62px]
              items-center
              justify-center
              rounded-full
              border
              border-[#76509a]/25
              bg-[#fffaf4]/65
              shadow-sm
              backdrop-blur-sm
            "
          >
            <span
              className="
                font-display
                text-[25px]
                font-semibold
                italic
                text-[#76509a]
              "
            >
              JV
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* DESKTOP — MANTÉM O ESTILO ATUAL                       */}
      {/* ===================================================== */}

      <div
        className="
          relative
          mx-auto
          hidden
          min-h-[720px]
          w-full
          max-w-[1500px]
          grid-cols-[0.96fr_1.04fr]
          items-center
          gap-8
          px-10
          pb-20
          pt-36
          lg:grid
        "
      >
        <div className="max-w-[660px]">
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#76509a]/15
              bg-white/80
              px-4
              py-2
              text-[11px]
              font-bold
              uppercase
              tracking-[0.20em]
              text-[#704093]
              shadow-sm
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#d2ad77]
              "
            />

            Harmonização & estética avançada
          </div>

          <h1
            className="
              mt-6
              font-display
              text-[72px]
              font-semibold
              leading-[0.98]
              tracking-[-0.035em]
              text-[#4f2d60]
              xl:text-[78px]
            "
          >
            Beleza que respeita
            <span className="block text-[#76509a]">
              a sua essência.
            </span>
          </h1>

          <p
            className="
              mt-6
              max-w-[560px]
              text-[17px]
              font-medium
              leading-7
              text-[#6c646d]
            "
          >
            Procedimentos estéticos personalizados,
            com cuidado, equilíbrio e atenção aos
            detalhes para valorizar sua beleza de
            forma natural.
          </p>

          <div className="mt-8 flex gap-3">
            <a
              href="#agendar"
              className="
                inline-flex
                min-h-[54px]
                items-center
                justify-center
                rounded-full
                bg-[#704093]
                px-7
                text-[14px]
                font-bold
                text-white
                shadow-[0_14px_30px_rgba(86,48,112,0.24)]
              "
            >
              Agende sua avaliação
              <span className="ml-3 text-xl">→</span>
            </a>

            <a
              href="#procedimentos"
              className="
                inline-flex
                min-h-[54px]
                items-center
                justify-center
                rounded-full
                border
                border-[#76509a]/25
                bg-white/70
                px-7
                text-[14px]
                font-bold
                text-[#704093]
              "
            >
              Ver procedimentos
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full">
          <div
            className="
              relative
              mx-auto
              aspect-[4/4.5]
              w-full
              max-w-[590px]
              overflow-hidden
              rounded-[46%_46%_24%_24%/26%_26%_12%_12%]
              border
              border-white/90
              bg-gradient-to-br
              from-[#efe3f3]
              via-[#fff8f2]
              to-[#ead9e1]
              shadow-[0_35px_90px_rgba(79,45,96,0.16)]
            "
          >
            <div className="absolute inset-0 flex items-center justify-center p-14">
              <div className="relative h-full w-full">
                <Image
                  src="/images/clinica.jpeg"
                  alt="Juliana Vieira - Farmacêutica Esteta"
                  fill
                  priority
                  sizes="580px"
                  className="
                    select-none
                    object-contain
                    object-center
                    mix-blend-multiply
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}