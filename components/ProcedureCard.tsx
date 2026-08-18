import Image from "next/image";
import type { Procedure } from "@/types/database";
import { formatPriceCents } from "@/lib/utils";

export default function ProcedureCard({
  procedure,
  selected,
  onSelect,
}: {
  procedure: Procedure;
  selected?: boolean;
  onSelect?: (procedure: Procedure) => void;
}) {
  const Wrapper = onSelect ? "button" : "div";

  return (
    <Wrapper
      type={onSelect ? "button" : undefined}
      onClick={onSelect ? () => onSelect(procedure) : undefined}
      className={`text-left w-full rounded-clinic border bg-white p-5 transition-shadow hover:shadow-md ${
        selected ? "border-clinic-sage ring-1 ring-clinic-sage" : "border-clinic-line"
      }`}
    >
      <div className="relative mb-4 h-40 w-full overflow-hidden rounded-clinic bg-clinic-line">
        {procedure.image_url ? (
          <Image
            src={procedure.image_url}
            alt={procedure.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-clinic-sage/60 text-sm">
            {procedure.name}
          </div>
        )}
      </div>
      <h3 className="font-display text-lg text-clinic-ink">{procedure.name}</h3>
      <p className="mt-1 text-sm text-clinic-ink/70 line-clamp-3">
        {procedure.description}
      </p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-clinic-sage-dark">
          {procedure.duration_minutes} min
        </span>
        <span className="font-medium">
          {formatPriceCents(procedure.price_cents)}
        </span>
      </div>
    </Wrapper>
  );
}
