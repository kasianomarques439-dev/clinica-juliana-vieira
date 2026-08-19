import type { Procedure } from "@/types/database";
import ProcedureCard from "./ProcedureCard";

export default function ProceduresGrid({
  procedures,
}: {
  procedures: Procedure[];
}) {
  return (
    <section
      id="procedimentos"
      className="
        w-full
        overflow-hidden
        bg-gradient-to-br
        from-[#7d4aa0]
        via-[#8652a8]
        to-[#684083]
        py-10
        md:py-12
      "
    >
      <div className="mx-auto w-full max-w-[1450px]">
        {/* CABEÇALHO */}
        <div className="mb-7 px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">
            Catálogo
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">
                Procedimentos
              </h2>

              <p className="mt-2 text-sm text-white/80">
                Escolha o procedimento que deseja conhecer.
              </p>
            </div>

            {/* INDICAÇÃO MOBILE */}
            <div
              className="
                hidden
                shrink-0
                items-center
                gap-2
                text-xs
                font-medium
                text-white/70
                min-[380px]:flex
                sm:hidden
              "
            >
              <span>Arraste</span>

              <span className="text-lg">
                →
              </span>
            </div>
          </div>
        </div>

        {procedures.length === 0 ? (
          <p className="px-4 text-white/70 sm:px-6 lg:px-8">
            Nenhum procedimento cadastrado no momento.
          </p>
        ) : (
          <>
            {/* ================================================= */}
            {/* MOBILE - 2 FILEIRAS COM ARRASTAR PARA A DIREITA */}
            {/* ================================================= */}
            <div
              className="
                grid
                grid-flow-col
                grid-rows-2
                auto-cols-[86vw]
                gap-4
                overflow-x-auto
                overscroll-x-contain
                px-4
                pb-4
                pr-8
                snap-x
                snap-mandatory

                sm:hidden

                [&::-webkit-scrollbar]:hidden
              "
              style={{
                scrollbarWidth: "none",
                WebkitOverflowScrolling:
                  "touch",
              }}
            >
              {procedures.map(
                (procedure) => (
                  <div
                    key={procedure.id}
                    className="
                      w-full
                      snap-start
                    "
                  >
                    <ProcedureCard
                      procedure={
                        procedure
                      }
                    />
                  </div>
                )
              )}
            </div>

            {/* ================================================= */}
            {/* TABLET / DESKTOP - GRADE NORMAL */}
            {/* ================================================= */}
            <div
              className="
                hidden
                px-6

                sm:grid
                sm:grid-cols-2
                sm:gap-4

                xl:grid-cols-4

                lg:px-8
              "
            >
              {procedures.map(
                (procedure) => (
                  <ProcedureCard
                    key={procedure.id}
                    procedure={procedure}
                  />
                )
              )}
            </div>
          </>
        )}

        {/* BARRINHA VISUAL MOBILE */}
        {procedures.length > 2 && (
          <div
            className="
              mt-5
              flex
              items-center
              justify-center
              gap-2
              sm:hidden
            "
          >
            <div
              className="
                h-1
                w-12
                rounded-full
                bg-white/80
              "
            />

            <div
              className="
                h-1
                w-5
                rounded-full
                bg-white/25
              "
            />

            <div
              className="
                h-1
                w-5
                rounded-full
                bg-white/25
              "
            />
          </div>
        )}
      </div>
    </section>
  );
}