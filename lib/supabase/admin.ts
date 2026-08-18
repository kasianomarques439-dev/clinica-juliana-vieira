import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Cliente com a SERVICE ROLE KEY. So pode ser importado por codigo que roda
// no servidor (API routes / server actions). O pacote "server-only" garante
// que, se algum dia for importado sem querer em um client component, o build
// vai falhar em vez de vazar a chave para o navegador.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
