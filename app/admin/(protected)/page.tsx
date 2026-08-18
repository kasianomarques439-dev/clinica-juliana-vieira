"use client";

import { useState } from "react";
import ProceduresManager from "@/components/admin/ProceduresManager";
import SlotsManager from "@/components/admin/SlotsManager";
import AppointmentsList from "@/components/admin/AppointmentsList";

type Tab = "agendamentos" | "procedimentos" | "horarios";

const TABS: { id: Tab; label: string }[] = [
  { id: "agendamentos", label: "Agendamentos" },
  { id: "procedimentos", label: "Procedimentos" },
  { id: "horarios", label: "Horarios" },
];

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>("agendamentos");

  return (
    <div>
      <div className="flex gap-2 mb-8 border-b border-clinic-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === t.id
                ? "border-clinic-sage-dark text-clinic-ink"
                : "border-transparent text-clinic-ink/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "agendamentos" && <AppointmentsList />}
      {tab === "procedimentos" && <ProceduresManager />}
      {tab === "horarios" && <SlotsManager />}
    </div>
  );
}
