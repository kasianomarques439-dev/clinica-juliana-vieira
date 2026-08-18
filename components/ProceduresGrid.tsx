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
        bg-gradient-to-br
        from-[#7d4aa0]
        via-[#8652a8]
        to-[#684083]
        py-10
        md:py-12
      "
    >
      <div className="mx-auto w-full max-w-[1450px] px-4 sm:px-6 lg:px-8">
        {/* TÍTULO */}
        <div className="mb-7">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">
            Catálogo
          </p>

          <h2 className="mt-2 font-display text-3xl font-semibold text-white md:text-4xl">
            Procedimentos
          </h2>

          <p className="mt-2 text-sm text-white/80">
            Escolha o procedimento que deseja conhecer.
          </p>
        </div>

        {procedures.length === 0 ? (
          <p className="text-white/70">
            Nenhum procedimento cadastrado no momento.
          </p>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
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
        )}
      </div>
    </section>
  );
}