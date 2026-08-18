import "server-only";
import { Resend } from "resend";
import type { Procedure, AvailableSlot } from "@/types/database";

// Envia um e-mail para a proprietaria da clinica avisando de um novo
// agendamento. Se as variaveis de ambiente nao estiverem configuradas,
// a funcao apenas registra um aviso no log em vez de quebrar o agendamento -
// assim o site continua funcionando mesmo antes do Resend ser configurado.
export async function sendNewAppointmentEmail(params: {
  fullName: string;
  phone: string;
  procedure: Pick<Procedure, "name">;
  slot: Pick<AvailableSlot, "slot_date" | "slot_time">;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.CLINIC_OWNER_EMAIL;

  if (!apiKey || !ownerEmail) {
    console.warn(
      "RESEND_API_KEY ou CLINIC_OWNER_EMAIL nao configurados - e-mail de notificacao nao enviado."
    );
    return;
  }

  const resend = new Resend(apiKey);
  const dateFormatted = new Date(
    `${params.slot.slot_date}T${params.slot.slot_time}`
  ).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });

  await resend.emails.send({
    from: "Agendamentos <onboarding@resend.dev>",
    to: ownerEmail,
    subject: `Novo agendamento: ${params.fullName}`,
    html: `
      <h2>Novo agendamento recebido</h2>
      <p><strong>Cliente:</strong> ${params.fullName}</p>
      <p><strong>Celular:</strong> ${params.phone}</p>
      <p><strong>Procedimento:</strong> ${params.procedure.name}</p>
      <p><strong>Data/hora:</strong> ${dateFormatted}</p>
    `,
  });
}
