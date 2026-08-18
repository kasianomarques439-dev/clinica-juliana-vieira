import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewAppointmentEmail } from "@/lib/email";
import { isValidPhone } from "@/lib/utils";

const bodySchema = z.object({
  slotId: z.string().uuid(),

  procedureId: z.string().uuid(),

  fullName: z
    .string()
    .trim()
    .min(3, "Nome inválido")
    .max(150, "Nome muito longo"),

  phone: z
    .string()
    .trim()
    .refine(
      isValidPhone,
      "Celular inválido"
    ),

  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(254)
    .transform((value) =>
      value.toLowerCase()
    ),
});

export async function POST(
  request: Request
) {
  try {
    /*
     * =========================================================
     * 1. LÊ O JSON RECEBIDO
     * =========================================================
     */
    const json = await request
      .json()
      .catch(() => null);

    /*
     * =========================================================
     * 2. VALIDA OS DADOS
     * =========================================================
     */
    const parsed =
      bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Dados inválidos. Confira nome, telefone e e-mail.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      slotId,
      procedureId,
      fullName,
      phone,
      email,
    } = parsed.data;

    /*
     * =========================================================
     * 3. CLIENTE ADMIN DO SUPABASE
     * =========================================================
     */
    const supabase =
      createAdminClient();

    /*
     * =========================================================
     * 4. VALIDA O PROCEDIMENTO
     *
     * IMPORTANTE:
     * Em vez de selecionar is_active e depois acessar:
     *
     * procedure.is_active
     *
     * filtramos diretamente no banco:
     *
     * .eq("is_active", true)
     *
     * Isso corrige o erro de TypeScript do deploy da Vercel.
     * =========================================================
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

      return NextResponse.json(
        {
          error:
            "Procedimento indisponível.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================================================
     * 5. VALIDA O HORÁRIO
     * =========================================================
     */
    const {
      data: slot,
      error: slotError,
    } = await supabase
      .from("available_slots")
      .select(
        "id, procedure_id, slot_date, slot_time, status"
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

      return NextResponse.json(
        {
          error:
            "Horário não encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * =========================================================
     * 6. CONFERE SE O HORÁRIO PERTENCE AO PROCEDIMENTO
     * =========================================================
     */
    if (
      slot.procedure_id !==
      procedureId
    ) {
      return NextResponse.json(
        {
          error:
            "Este horário não pertence ao procedimento selecionado.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================================================
     * 7. CONFERE SE O HORÁRIO AINDA ESTÁ ABERTO
     * =========================================================
     */
    if (
      slot.status !== "open"
    ) {
      return NextResponse.json(
        {
          error:
            "Este horário não está mais disponível.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * =========================================================
     * 8. NORMALIZA O TELEFONE
     *
     * Exemplo:
     * (55) 99999-9999
     *
     * vira:
     *
     * 55999999999
     * =========================================================
     */
    const normalizedPhone =
      phone.replace(/\D/g, "");

    /*
     * =========================================================
     * 9. CRIA O AGENDAMENTO
     *
     * A função create_appointment do Supabase faz a reserva
     * protegida contra dois clientes pegarem o mesmo horário.
     * =========================================================
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

    /*
     * =========================================================
     * 10. TRATA ERROS DA FUNÇÃO DE AGENDAMENTO
     * =========================================================
     */
    if (appointmentError) {
      console.error(
        "Erro na create_appointment:",
        appointmentError
      );

      const message =
        appointmentError.message.toLowerCase();

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
        );

      if (unavailable) {
        return NextResponse.json(
          {
            error:
              "Este horário acabou de ser reservado por outra pessoa. Escolha outro horário.",
          },
          {
            status: 409,
          }
        );
      }

      if (
        message.includes(
          "procedimento"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Procedimento inválido para este horário.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        message.includes("nome")
      ) {
        return NextResponse.json(
          {
            error:
              "Informe um nome válido.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        message.includes(
          "telefone"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Informe um celular válido.",
          },
          {
            status: 400,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            "Não foi possível confirmar o agendamento. Tente novamente.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * =========================================================
     * 11. GARANTE QUE A RPC RETORNOU O ID
     * =========================================================
     */
    if (!appointmentId) {
      console.error(
        "A RPC create_appointment não retornou o ID do agendamento."
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível confirmar o agendamento.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * =========================================================
     * 12. SALVA O E-MAIL DO CLIENTE
     *
     * A RPC atual ainda não recebe e-mail.
     * Por isso salvamos logo após criar o agendamento.
     * =========================================================
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
     * 13. ENVIA NOTIFICAÇÃO POR E-MAIL
     *
     * Falha no e-mail NÃO cancela um agendamento que já foi
     * confirmado no banco.
     * =========================================================
     */
    try {
      await sendNewAppointmentEmail(
        {
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
        }
      );
    } catch (emailError) {
      console.error(
        "Falha ao enviar e-mail de notificação:",
        emailError
      );
    }

    /*
     * =========================================================
     * 14. SUCESSO
     * =========================================================
     */
    return NextResponse.json(
      {
        id: appointmentId,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Erro inesperado na API de agendamento:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erro interno. Tente novamente.",
      },
      {
        status: 500,
      }
    );
  }
}