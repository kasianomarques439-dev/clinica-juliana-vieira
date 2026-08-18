import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#fbf5ec]">
      <div
        className="
          mx-auto
          flex
          min-h-[760px]
          w-full
          max-w-[1600px]
          flex-col
          items-center
          justify-center
          px-4
          pb-14
          pt-28
          sm:px-6
          md:min-h-[820px]
          md:px-8
          lg:min-h-[860px]
          lg:px-12
        "
      >
        {/* LOGO */}
        <div
          className="
            relative
            h-[260px]
            w-full
            max-w-[760px]
            sm:h-[310px]
            sm:max-w-[820px]
            md:h-[360px]
            md:max-w-[900px]
            lg:h-[400px]
            lg:max-w-[980px]
          "
        >
          <Image
            src="/images/clinica.jpeg"
            alt="Juliana Vieira - Farmacêutica Esteta"
            fill
            priority
            sizes="
              (max-width: 640px) 92vw,
              (max-width: 1024px) 80vw,
              980px
            "
            className="
              select-none
              object-contain
              object-center
              mix-blend-multiply
            "
          />
        </div>

        {/* FRASE */}
        <p
          className="
            mt-3
            max-w-3xl
            text-center
            text-[15px]
            leading-7
            text-[#655d57]
            sm:text-base
            md:mt-5
            md:text-lg
          "
        >
          Estética avançada com cuidado,
          equilíbrio e atenção aos detalhes.
        </p>

        {/* BOTÕES */}
        <div
          className="
            mt-7
            flex
            w-full
            max-w-[520px]
            flex-col
            items-center
            justify-center
            gap-3
            sm:flex-row
          "
        >
          <a
            href="#procedimentos"
            className="
              inline-flex
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
              shadow-[0_12px_30px_rgba(118,80,154,0.20)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#674286]
              sm:w-auto
              sm:min-w-[220px]
            "
          >
            Ver procedimentos
          </a>

          <a
            href="#agendar"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              rounded-full
              border
              border-[#76509a]/35
              bg-transparent
              px-8
              py-4
              text-sm
              font-semibold
              text-[#76509a]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-[#76509a]
              hover:bg-[#76509a]/5
              sm:w-auto
              sm:min-w-[220px]
            "
          >
            Agendar horário
          </a>
        </div>

        {/* ENDEREÇO */}
        <div
          className="
            mt-8
            flex
            max-w-xl
            items-center
            gap-3
            rounded-full
            border
            border-[#76509a]/15
            bg-white/35
            px-5
            py-3
            shadow-[0_8px_24px_rgba(75,48,92,0.06)]
            backdrop-blur-sm
            sm:px-6
          "
        >
          {/* ÍCONE */}
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#76509a]/10
              text-[#76509a]
            "
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21C12 21 18 15.5 18 9.5C18 6.18629 15.3137 3.5 12 3.5C8.68629 3.5 6 6.18629 6 9.5C6 15.5 12 21 12 21Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle
                cx="12"
                cy="9.5"
                r="2.2"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
          </div>

          {/* TEXTO DO ENDEREÇO */}
          <div className="min-w-0 text-left">
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[#76509a]/70
              "
            >
              Onde estamos
            </p>

            <p
              className="
                mt-0.5
                text-[13px]
                font-medium
                leading-5
                text-[#514a46]
                sm:text-sm
              "
            >
              Setembrino de Carvalho, 969
              <span className="mx-2 text-[#76509a]/40">
                •
              </span>
              Uruguaiana
            </p>
          </div>
        </div>

        {/* SETA */}
        <a
          href="#procedimentos"
          aria-label="Ir para procedimentos"
          className="
            mt-8
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border
            border-[#76509a]/30
            bg-transparent
            text-lg
            text-[#76509a]
            transition
            duration-300
            hover:translate-y-1
            hover:bg-[#76509a]/5
          "
        >
          ↓
        </a>
      </div>
    </section>
  );
}