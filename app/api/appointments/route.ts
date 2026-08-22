import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewAppointmentEmail } from "@/lib/email";
import { isValidPhone } from "@/lib/utils";

/*
 * ============================================================
 * PROTEÇÃO CONTRA SPAM / ABUSO
 * ============================================================
 *
 * Esta é uma primeira camada de proteção dentro da aplicação.
 *
 * Limites:
 * - máximo de 6 requisições por IP em 10 minutos;
 * - máximo de 3 tentativas para o mesmo telefone em 30 minutos.
 *
 * Depois adicionaremos uma camada mais forte usando proteção
 * da Vercel/CAPTCHA.
 * ============================================================
 */

type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

const ipRateLimit = new Map<string, RateLimitEntry>();
const phoneRateLimit = new Map<string, RateLimitEntry>();

const IP_LIMIT = 6;
const IP_WINDOW_MS = 10 * 60 * 1000;

const PHONE_LIMIT = 3;
const PHONE_WINDOW_MS = 30 * 60 * 1000;

const MAX_BODY_SIZE = 4096;

/*
 * ============================================================
 * VALIDAÇÃO DO FORMULÁRIO
 * ============================================================
 */

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
    .refine(isValidPhone, "Celular inválido"),

  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(254)
    .transform((value) => value.toLowerCase()),
});

/*
 * ============================================================
 * PEGA O IP DA REQUISIÇÃO
 * ============================================================
 */

function getClientIp(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      ?.trim()
      .slice(0, 100);
  }

  const realIp =
    request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim().slice(0, 100);
  }

  return "unknown";
}

/*
 * ============================================================
 * FUNÇÃO DE RATE LIMIT
 * ============================================================
 */

function checkRateLimit(
  store: Map<string, RateLimitEntry>,
  key: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();

  const current =
    store.get(key);

  if (
    !current ||
    current.expiresAt <= now
  ) {
    store.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });

    return {
      allowed: true,
      retryAfter: 0,
    };
  }

  if (current.count >= limit) {
    const retryAfter =
      Math.max(
        1,
        Math.ceil(
          (current.expiresAt - now) /
            1000
        )
      );

    return {
      allowed: false,
      retryAfter,
    };
  }

  current.count += 1;

  store.set(key, current);

  return {
    allowed: true,
    retryAfter: 0,
  };
}

/*
 * ============================================================
 * LIMPEZA DE REGISTROS EXPIRADOS
 * ============================================================
 */

function cleanupRateLimits() {
  const now = Date.now();

  for (const [key, value] of ipRateLimit) {
    if (value.expiresAt <= now) {
      ipRateLimit.delete(key);
    }
  }

  for (
    const [key, value] of phoneRateLimit
  ) {
    if (value.expiresAt <= now) {
      phoneRateLimit.delete(key);
    }
  }
}

/*
 * ============================================================
 * RESPOSTA PADRÃO SEM CACHE
 * ============================================================
 */

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  extraHeaders?: Record<string, string>
) {
  return NextResponse.json(
    body,
    {
      status,

      headers: {
        "Cache-Control":
          "no-store, max-age=0",

        ...extraHeaders,
      },
    }
  );
}

/*
 * ============================================================
 * API DE AGENDAMENTO
 * ============================================================
 */

export async function POST(
  request: Request
) {
  try {
    /*
     * =========================================================
     * 1. LIMPEZA DO RATE LIMIT
     * =========================================================
     */

    cleanupRateLimits();

    /*
     * =========================================================
     * 2. PROTEÇÃO CONTRA REQUISIÇÃO CROSS-SITE
     * =========================================================
     *
     * Isso dificulta que outro site tente disparar o endpoint
     * através do navegador da vítima.
     * =========================================================
     */

    const requestUrl =
      new URL(request.url);

    const origin =
      request.headers.get("origin");

    const fetchSite =
      request.headers.get(
        "sec-fetch-site"
      );

    if (fetchSite === "cross-site") {
      return jsonResponse(
        {
          error:
            "Requisição não autorizada.",
        },
        403
      );
    }

    if (
      origin &&
      origin !== requestUrl.origin
    ) {
      return jsonResponse(
        {
          error:
            "Origem da requisição não autorizada.",
        },
        403
      );
    }

    /*
     * =========================================================
     * 3. RATE LIMIT POR IP
     * =========================================================
     */

    const clientIp =
      getClientIp(request);

    const ipCheck =
      checkRateLimit(
        ipRateLimit,
        clientIp,
        IP_LIMIT,
        IP_WINDOW_MS
      );

    if (!ipCheck.allowed) {
      return jsonResponse(
        {
          error:
            "Muitas tentativas de agendamento. Aguarde alguns minutos e tente novamente.",
        },
        429,
        {
          "Retry-After":
            String(
              ipCheck.retryAfter
            ),
        }
      );
    }

    /*
     * =========================================================
     * 4. ACEITA APENAS JSON
     * =========================================================
     */

    const contentType =
      request.headers.get(
        "content-type"
      );

    if (
      !contentType
        ?.toLowerCase()
        .includes(
          "application/json"
        )
    ) {
      return jsonResponse(
        {
          error:
            "Formato de requisição inválido.",
        },
        415
      );
    }

    /*
     * =========================================================
     * 5. LIMITA O TAMANHO DA REQUISIÇÃO
     * =========================================================
     */

    const contentLength =
      request.headers.get(
        "content-length"
      );

    if (contentLength) {
      const size =
        Number(contentLength);

      if (
        Number.isFinite(size) &&
        size > MAX_BODY_SIZE
      ) {
        return jsonResponse(
          {
            error:
              "Requisição muito grande.",
          },
          413
        );
      }
    }

    /*
     * =========================================================
     * 6. LÊ O JSON
     * =========================================================
     */

    const rawBody =
      await request.text();

    if (
      rawBody.length >
      MAX_BODY_SIZE
    ) {
      return jsonResponse(
        {
          error:
            "Requisição muito grande.",
        },
        413
      );
    }

    let json: unknown;

    try {
      json =
        JSON.parse(rawBody);
    } catch {
      return jsonResponse(
        {
          error:
            "Dados inválidos.",
        },
        400
      );
    }

    /*
     * =========================================================
     * 7. VALIDA OS DADOS RECEBIDOS
     * =========================================================
     */

    const parsed =
      bodySchema.safeParse(json);

    if (!parsed.success) {
      return jsonResponse(
        {
          error:
            "Dados inválidos. Confira nome, telefone e e-mail.",
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

    /*
     * =========================================================
     * 8. NORMALIZA O TELEFONE
     * =========================================================
     */

    const normalizedPhone =
      phone.replace(/\D/g, "");

    /*
     * =========================================================
     * 9. RATE LIMIT PELO TELEFONE
     * =========================================================
     *
     * Mesmo que alguém troque rapidamente de IP,
     * não poderá tentar agendar inúmeras vezes usando
     * o mesmo telefone.
     * =========================================================
     */

    const phoneCheck =
      checkRateLimit(
        phoneRateLimit,
        normalizedPhone,
        PHONE_LIMIT,
        PHONE_WINDOW_MS
      );

    if (!phoneCheck.allowed) {
      return jsonResponse(
        {
          error:
            "Muitas tentativas para este número. Aguarde um pouco antes de tentar novamente.",
        },
        429,
        {
          "Retry-After":
            String(
              phoneCheck.retryAfter
            ),
        }
      );
    }

    /*
     * =========================================================
     * 10. CLIENTE ADMIN DO SUPABASE
     * =========================================================
     *
     * A SERVICE ROLE permanece somente no servidor.
     * =========================================================
     */

    const supabase =
      createAdminClient();

    /*
     * =========================================================
     * 11. CONFERE O PROCEDIMENTO
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
     * 12. CONFERE O HORÁRIO
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
     * 13. CONFERE PROCEDIMENTO DO HORÁRIO
     * =========================================================
     */

    if (
      slot.procedure_id !==
      procedureId
    ) {
      return jsonResponse(
        {
          error:
            "Este horário não pertence ao procedimento selecionado.",
        },
        400
      );
    }

    /*
     * =========================================================
     * 14. CONFERE SE O HORÁRIO ESTÁ LIVRE
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
     * 15. CRIA O AGENDAMENTO
     * =========================================================
     *
     * create_appointment agora só pode ser chamada
     * pela SERVICE ROLE.
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
     * 16. TRATA ERROS DO AGENDAMENTO
     * =========================================================
     */

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
              "Procedimento inválido para este horário.",
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

      return jsonResponse(
        {
          error:
            "Não foi possível confirmar o agendamento. Tente novamente.",
        },
        500
      );
    }

    /*
     * =========================================================
     * 17. GARANTE QUE RECEBEU ID
     * =========================================================
     */

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
     * 18. SALVA O E-MAIL
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
     * 19. ENVIA NOTIFICAÇÃO POR E-MAIL
     * =========================================================
     *
     * Se o envio do e-mail falhar, o agendamento
     * continua confirmado.
     * =========================================================
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
     * 20. SUCESSO
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