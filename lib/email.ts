import { Resend } from "resend";

import type {
  AvailableSlot,
  Procedure,
} from "@/types/database";

type SendNewAppointmentEmailParams = {
  fullName: string;
  phone: string;
  email: string;

  procedure: Pick<
    Procedure,
    "name"
  >;

  slot: Pick<
    AvailableSlot,
    "slot_date" | "slot_time"
  >;
};

function escapeHtml(
  value: string
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendNewAppointmentEmail(
  params: SendNewAppointmentEmailParams
) {
  const apiKey =
    process.env.RESEND_API_KEY;

  const ownerEmail =
    process.env.CLINIC_OWNER_EMAIL;

  if (!apiKey || !ownerEmail) {
    console.warn(
      "RESEND_API_KEY ou CLINIC_OWNER_EMAIL não configurados - e-mail de notificação não enviado."
    );

    return;
  }

  const resend =
    new Resend(apiKey);

  const dateFormatted =
    new Date(
      `${params.slot.slot_date}T00:00:00`
    ).toLocaleDateString(
      "pt-BR",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  const timeFormatted =
    params.slot.slot_time.slice(
      0,
      5
    );

  const safeFullName =
    escapeHtml(
      params.fullName
    );

  const safePhone =
    escapeHtml(
      params.phone
    );

  const safeEmail =
    escapeHtml(
      params.email
    );

  const safeProcedure =
    escapeHtml(
      params.procedure.name
    );

  const {
    data,
    error,
  } =
    await resend.emails.send({
      from:
        "Agendamentos <onboarding@resend.dev>",

      to: [
        ownerEmail,
      ],

      subject:
        `Novo agendamento - ${params.fullName}`,

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            color: #2f2a27;
          "
        >
          <h2
            style="
              margin-bottom: 24px;
              color: #875A3D;
            "
          >
            Novo agendamento recebido
          </h2>

          <p>
            Um novo agendamento foi confirmado pelo site.
          </p>

          <div
            style="
              margin-top: 24px;
              padding: 20px;
              border: 1px solid #e6ded8;
              border-radius: 10px;
              background: #faf8f6;
            "
          >
            <p>
              <strong>Nome:</strong>
              ${safeFullName}
            </p>

            <p>
              <strong>Telefone:</strong>
              ${safePhone}
            </p>

            <p>
              <strong>E-mail:</strong>
              ${safeEmail}
            </p>

            <p>
              <strong>Procedimento:</strong>
              ${safeProcedure}
            </p>

            <p>
              <strong>Data:</strong>
              ${dateFormatted}
            </p>

            <p>
              <strong>Horário:</strong>
              ${timeFormatted}
            </p>
          </div>
        </div>
      `,
    });

  if (error) {
    console.error(
      "Erro do Resend ao enviar notificação:",
      error
    );

    throw new Error(
      "Falha ao enviar e-mail de notificação."
    );
  }

  return data;
}