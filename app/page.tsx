import { createClient } from "@/lib/supabase/server";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProceduresGrid from "@/components/ProceduresGrid";
import BookingForm from "@/components/BookingForm";
import InstagramSection from "@/components/InstagramSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: procedures, error } = await supabase
    .from("procedures")
    .select("*")
    .eq("is_active", true)
    .neq("name", "Avaliação")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Erro ao carregar procedimentos:", error);
  }

  return (
    <main>
      <Header />
      <Hero />
      <ProceduresGrid procedures={procedures ?? []} />
      <BookingForm />
      <InstagramSection />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
