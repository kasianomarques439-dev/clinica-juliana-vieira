"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AppointmentRow {
  id: string;
  full_name: string;
  phone: string;
  cpf: string;
  status: string;
  created_at: string;
  available_slots: { slot_date: string; slot_time: string } | null;
  procedures: { name: string } | null;
}

export default function AppointmentsList() {
  const supabase = createClient();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("appointments")
      .select(
        "id, full_name, phone, cpf, status, created_at, available_slots(slot_date, slot_time), procedures(name)"
      )
      .order("created_at", { ascending: false });
    setAppointments((data as unknown as AppointmentRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cancel(id: string) {
    if (!confirm("Cancelar este agendamento? O horario voltara a ficar livre.")) return;
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    load();
  }

  if (loading) return <p className="text-sm text-clinic-ink/60">Carregando...</p>;

  if (appointments.length === 0) {
    return <p className="text-sm text-clinic-ink/60">Nenhum agendamento ainda.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-clinic-ink/60 border-b border-clinic-line">
            <th className="py-2 pr-4">Cliente</th>
            <th className="py-2 pr-4">Celular</th>
            <th className="py-2 pr-4">CPF</th>
            <th className="py-2 pr-4">Procedimento</th>
            <th className="py-2 pr-4">Data/Hora</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id} className="border-b border-clinic-line/60">
              <td className="py-2 pr-4">{a.full_name}</td>
              <td className="py-2 pr-4">{a.phone}</td>
              <td className="py-2 pr-4">{a.cpf}</td>
              <td className="py-2 pr-4">{a.procedures?.name ?? "-"}</td>
              <td className="py-2 pr-4">
                {a.available_slots
                  ? `${new Date(
                      a.available_slots.slot_date + "T00:00:00"
                    ).toLocaleDateString("pt-BR")} ${a.available_slots.slot_time.slice(0, 5)}`
                  : "-"}
              </td>
              <td className="py-2 pr-4">
                {a.status === "confirmed" ? "Confirmado" : "Cancelado"}
              </td>
              <td className="py-2 pr-4">
                {a.status === "confirmed" && (
                  <button
                    onClick={() => cancel(a.id)}
                    className="underline text-red-600 text-xs"
                  >
                    Cancelar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
