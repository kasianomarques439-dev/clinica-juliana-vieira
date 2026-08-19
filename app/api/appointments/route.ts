import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { sendNewAppointmentEmail } from "@/lib/email";
import { isValidPhone } from "@/lib/utils";

export const runtime = "nodejs";

const bodySchema = z.object({
  slotId: z.string().uuid("Horário inválido"),

  procedureId: z.string().uuid("Procedimento inválido"),

  fullName: z
    .string()
    .trim()
    .min(3, "Nome inválido")
    .max(150, "Nome muito longo"),

  phone: z
    .string()
    .trim()
    .refine(isValidPhone, "Celular inválido"),

  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(254)
    .transform((value) => value.toLowerCase()),
});

function jsonResponse(
  body: Record<string, unknown>,
  status: number
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function createServerSupabaseClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL não configurada."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function POST(
  request: Request
) {
  try {
    const json = await request
      .json()
      .catch(() => null);

    const parsed =
      bodySchema.safeParse(json);

    if (!parsed.success) {
      return jsonResponse(
        {
          error:
            "Dados inválidos. Confira procedimento, horário, nome, telefone e e-mail.",
        },
        400
      );
    }

    const {
      slotId,
      procedureId,
      fullName,
      phone,
      email,
    } = parsed.data;

    const supabase =
      createServerSupabaseClient();

    /*
     * =========================================================
     * 1. VALIDA O PROCEDIMENTO
     * =========================================================
     *
     * O procedimento continua obrigatório e é salvo
     * no agendamento, mas NÃO pertence mais ao slot.
     */
    const {
      data: procedure,
      error: procedureError,
    } = await supabase
      .from("procedures")
      .select("id, name")
      .eq("id", procedureId)
      .eq("is_active", true)
      .maybeSingle();

    if (
      procedureError ||
      !procedure
    ) {
      if (procedureError) {
        console.error(
          "Erro ao validar procedimento:",
          procedureError
        );
      }

      return jsonResponse(
        {
          error:
            "Procedimento indisponível.",
        },
        400
      );
    }

    /*
     * =========================================================
     * 2. VALIDA O HORÁRIO GLOBAL
     * =========================================================
     *
     * IMPORTANTE:
     * O slot agora é GLOBAL.
     *
     * Não fazemos mais:
     * slot.procedure_id === procedureId
     *
     * porque procedure_id do slot fica NULL.
     */
    const {
      data: slot,
      error: slotError,
    } = await supabase
      .from("available_slots")
      .select(
        "id, slot_date, slot_time, status"
      )
      .eq("id", slotId)
      .maybeSingle();

    if (
      slotError ||
      !slot
    ) {
      if (slotError) {
        console.error(
          "Erro ao validar horário:",
          slotError
        );
      }

      return jsonResponse(
        {
          error:
            "Horário não encontrado.",
        },
        404
      );
    }

    /*
     * =========================================================
     * 3. CONFERE SE O HORÁRIO ESTÁ LIVRE
     * =========================================================
     */
    if (
      slot.status !== "open"
    ) {
      return jsonResponse(
        {
          error:
            "Este horário não está mais disponível.",
        },
        409
      );
    }

    /*
     * =========================================================
     * 4. NÃO PERMITE HORÁRIO NO PASSADO
     * =========================================================
     */
    const today =
      new Date().toISOString().slice(0, 10);

    if (
      slot.slot_date < today
    ) {
      return jsonResponse(
        {
          error:
            "Não é possível agendar um horário passado.",
        },
        400
      );
    }

    /*
     * =========================================================
     * 5. NORMALIZA TELEFONE
     * =========================================================
     */
    const normalizedPhone =
      phone.replace(/\D/g, "");

    /*
     * =========================================================
     * 6. CRIA O AGENDAMENTO
     * =========================================================
     *
     * A RPC no banco:
     * - trava o slot com FOR UPDATE;
     * - confirma se ainda está open;
     * - salva o procedimento escolhido;
     * - muda o slot global para booked.
     *
     * Portanto duas clientes não conseguem ficar
     * com o mesmo dia/horário.
     */
    const {
      data: appointmentId,
      error: appointmentError,
    } = await supabase.rpc(
      "create_appointment",
      {
        p_slot_id:
          slotId,

        p_procedure_id:
          procedureId,

        p_full_name:
          fullName.trim(),

        p_phone:
          normalizedPhone,
      }
    );

    if (appointmentError) {
      console.error(
        "Erro na create_appointment:",
        appointmentError
      );

      const message =
        appointmentError.message
          .toLowerCase();

      const unavailable =
        message.includes(
          "não está disponível"
        ) ||
        message.includes(
          "nao esta disponivel"
        ) ||
        message.includes(
          "reservado"
        ) ||
        message.includes(
          "reserv"
        ) ||
        message.includes(
          "booked"
        ) ||
        message.includes(
          "horário"
        ) ||
        message.includes(
          "horario"
        );

      if (unavailable) {
        return jsonResponse(
          {
            error:
              "Este horário acabou de ser reservado por outra pessoa. Escolha outro horário.",
          },
          409
        );
      }

      if (
        message.includes(
          "procedimento"
        )
      ) {
        return jsonResponse(
          {
            error:
              "O procedimento selecionado não está disponível.",
          },
          400
        );
      }

      if (
        message.includes("nome")
      ) {
        return jsonResponse(
          {
            error:
              "Informe um nome válido.",
          },
          400
        );
      }

      if (
        message.includes(
          "telefone"
        )
      ) {
        return jsonResponse(
          {
            error:
              "Informe um celular válido.",
          },
          400
        );
      }

      if (
        message.includes(
          "domingo"
        )
      ) {
        return jsonResponse(
          {
            error:
              "Não há atendimento aos domingos.",
          },
          400
        );
      }

      if (
        message.includes(
          "período de atendimento"
        ) ||
        message.includes(
          "periodo de atendimento"
        )
      ) {
        return jsonResponse(
          {
            error:
              "Horário fora do período de atendimento.",
          },
          400
        );
      }

      return jsonResponse(
        {
          error:
            "Não foi possível confirmar o agendamento. Tente novamente.",
        },
        500
      );
    }

    if (!appointmentId) {
      console.error(
        "A RPC create_appointment não retornou o ID do agendamento."
      );

      return jsonResponse(
        {
          error:
            "Não foi possível confirmar o agendamento.",
        },
        500
      );
    }

    /*
     * =========================================================
     * 7. SALVA O E-MAIL DO CLIENTE
     * =========================================================
     *
     * A RPC ainda recebe:
     * horário, procedimento, nome e telefone.
     *
     * Por isso o email é salvo logo depois.
     */
    const {
      error: emailSaveError,
    } = await supabase
      .from("appointments")
      .update({
        email,
      })
      .eq(
        "id",
        appointmentId
      );

    if (emailSaveError) {
      console.error(
        "Erro ao salvar e-mail do cliente:",
        emailSaveError
      );
    }

    /*
     * =========================================================
     * 8. ENVIA E-MAIL PARA A CLÍNICA
     * =========================================================
     *
     * Falha no envio do e-mail não cancela
     * o agendamento já confirmado.
     */
    try {
      await sendNewAppointmentEmail({
        fullName:
          fullName.trim(),

        phone:
          normalizedPhone,

        email,

        procedure: {
          name:
            procedure.name,
        },

        slot: {
          slot_date:
            slot.slot_date,

          slot_time:
            slot.slot_time,
        },
      });
    } catch (emailError) {
      console.error(
        "Falha ao enviar e-mail de notificação:",
        emailError
      );
    }

    /*
     * =========================================================
     * 9. SUCESSO
     * =========================================================
     */
    return jsonResponse(
      {
        id: appointmentId,
      },
      201
    );
  } catch (error) {
    console.error(
      "Erro inesperado na API de agendamento:",
      error
    );

    return jsonResponse(
      {
        error:
          "Erro interno. Tente novamente.",
      },
      500
    );
  }
}