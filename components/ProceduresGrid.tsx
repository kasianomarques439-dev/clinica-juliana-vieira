import type { Procedure } from "@/types/database";
import ProcedureCard from "./ProcedureCard";

type ProceduresGridProps = {
  procedures: Procedure[];
};

export default function ProceduresGrid({
  procedures,
}: ProceduresGridProps) {
  const mobileGroups: Procedure[][] = [];

  for (
    let index = 0;
    index < procedures.length;
    index += 2
  ) {
    mobileGroups.push(
      procedures.slice(index, index + 2)
    );
  }

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

            {procedures.length > 2 && (
              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-1.5
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-white/75
                  sm:hidden
                "
              >
                <span>Arraste</span>
                <span className="text-xl leading-none">
                  →
                </span>
              </div>
            )}
          </div>
        </div>

        {procedures.length === 0 ? (
          <p className="px-4 text-white/70 sm:px-6 lg:px-8">
            Nenhum procedimento cadastrado no momento.
          </p>
        ) : (
          <>
            {/* MOBILE - 2 PROCEDIMENTOS POR COLUNA */}
            <div
              className="
                flex
                w-full
                snap-x
                snap-mandatory
                gap-4
                overflow-x-auto
                overscroll-x-contain
                px-4
                pb-5
                sm:hidden
                [&::-webkit-scrollbar]:hidden
              "
              style={{
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {mobileGroups.map(
                (group, groupIndex) => {
                  if (group.length === 0) {
                    return null;
                  }

                  return (
                    <div
                      key={
                        group[0]?.id ??
                        `grupo-${groupIndex}`
                      }
                      className="
                        flex
                        w-[88vw]
                        max-w-[390px]
                        flex-none
                        snap-start
                        flex-col
                        gap-4
                      "
                    >
                      {group.map((procedure) => (
                        <div
                          key={procedure.id}
                          className="w-full flex-none"
                        >
                          <ProcedureCard
                            procedure={procedure}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
              )}

              <div
                aria-hidden="true"
                className="w-1 shrink-0"
              />
            </div>

            {/* INDICADOR MOBILE */}
            {mobileGroups.length > 1 && (
              <div
                className="
                  mt-1
                  flex
                  items-center
                  justify-center
                  gap-2
                  sm:hidden
                "
              >
                {mobileGroups
                  .slice(0, 5)
                  .map((_group, index) => (
                    <span
                      key={index}
                      className={`
                        block
                        h-1.5
                        rounded-full
                        ${
                          index === 0
                            ? "w-8 bg-white/85"
                            : "w-3 bg-white/30"
                        }
                      `}
                    />
                  ))}
              </div>
            )}

            {/* TABLET E DESKTOP */}
            <div
              className="
                hidden
                px-6
                sm:grid
                sm:grid-cols-2
                sm:gap-4
                lg:px-8
                xl:grid-cols-4
              "
            >
              {procedures.map((procedure) => (
                <ProcedureCard
                  key={procedure.id}
                  procedure={procedure}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}