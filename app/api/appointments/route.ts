import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewAppointmentEmail } from "@/lib/email";
import { isValidCpf, isValidPhone } from "@/lib/utils";

const bodySchema = z.object({
  slotId: z.string().uuid(),
  procedureId: z.string().uuid(),
  fullName: z.string().min(3).max(150),
  phone: z.string().refine(isValidPhone, "Celular invalido"),
  cpf: z.string().refine(isValidCpf, "CPF invalido"),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos. Confira o formulario e tente novamente." },
      { status: 400 }
    );
  }

  const { slotId, procedureId, fullName, phone, cpf } = parsed.data;
  const supabase = createAdminClient();

  // busca o procedimento e o slot para validar que ainda existem/estao ativos
  const [{ data: procedure }, { data: slot }] = await Promise.all([
    supabase
      .from("procedures")
      .select("id, name, is_active")
      .eq("id", procedureId)
      .single(),
    supabase
      .from("available_slots")
      .select("id, slot_date, slot_time, status")
      .eq("id", slotId)
      .single(),
  ]);

  if (!procedure || !procedure.is_active) {
    return NextResponse.json(
      { error: "Procedimento indisponivel." },
      { status: 400 }
    );
  }

  if (!slot || slot.status !== "open") {
    return NextResponse.json(
      { error: "Este horario nao esta mais disponivel." },
      { status: 409 }
    );
  }

  // A insercao dispara a trigger handle_new_appointment no banco, que marca
  // o slot como 'booked' de forma atomica. Se duas pessoas tentarem o mesmo
  // horario ao mesmo tempo, a constraint unique(slot_id) e a trigger
  // garantem que apenas uma tera sucesso - a outra recebe erro aqui.
  const { data: appointment, error: insertError } = await supabase
    .from("appointments")
    .insert({
      slot_id: slotId,
      procedure_id: procedureId,
      full_name: fullName,
      phone: phone.replace(/\D/g, ""),
      cpf: cpf.replace(/\D/g, ""),
    })
    .select("id")
    .single();

  if (insertError) {
    const isDuplicate =
      insertError.code === "23505" || // unique_violation
      insertError.message.includes("nao esta mais disponivel");

    return NextResponse.json(
      {
        error: isDuplicate
          ? "Este horario acabou de ser reservado por outra pessoa."
          : "Nao foi possivel confirmar o agendamento. Tente novamente.",
      },
      { status: isDuplicate ? 409 : 500 }
    );
  }

  // e-mail de notificacao para a proprietaria - falha aqui nao deve
  // impedir a confirmacao do agendamento, que ja esta salvo no banco
  try {
    await sendNewAppointmentEmail({
      fullName,
      phone,
      procedure: { name: procedure.name },
      slot: { slot_date: slot.slot_date, slot_time: slot.slot_time },
    });
  } catch (emailError) {
    console.error("Falha ao enviar e-mail de notificacao:", emailError);
  }

  return NextResponse.json({ id: appointment.id }, { status: 201 });
}
