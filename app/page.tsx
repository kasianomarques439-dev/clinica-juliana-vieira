import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProceduresGrid from "@/components/ProceduresGrid";
import BookingForm from "@/components/BookingForm";
import MapSection from "@/components/MapSection";
import InstagramSection from "@/components/InstagramSection";
import Footer from "@/components/Footer";

// Pagina renderizada no servidor a cada requisicao, para sempre mostrar
// o catalogo de procedimentos atualizado.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: procedures } = await supabase
    .from("procedures")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return (
    <main>
      <Header />
      <Hero />
      <ProceduresGrid procedures={procedures ?? []} />
      <BookingForm procedures={procedures ?? []} />
      <MapSection />
      <InstagramSection />
      <Footer />
    </main>
  );
}
