import type { Procedure } from "@/types/database";
import ProcedureCard from "./ProcedureCard";

export default function ProceduresGrid({
  procedures,
}: {
  procedures: Procedure[];
}) {
  return (
    <section id="procedimentos" className="container-clinic py-20 md:py-28">
      <p className="text-clinic-sage-dark text-sm tracking-[0.2em] uppercase mb-3">
        Catalogo
      </p>
      <h2 className="font-display text-3xl md:text-4xl text-clinic-ink max-w-xl">
        Procedimentos
      </h2>

      {procedures.length === 0 ? (
        <p className="mt-8 text-clinic-ink/60">
          Nenhum procedimento cadastrado no momento.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {procedures.map((procedure) => (
            <ProcedureCard key={procedure.id} procedure={procedure} />
          ))}
        </div>
      )}
    </section>
  );
}
