import type { ReactNode } from "react";
import LogoutButton from "@/components/LogoutButton";

// A protecao real de acesso (redirecionar quem nao esta logado) acontece no
// middleware.ts, que roda antes desta pagina para todas as rotas /admin/*.
export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-clinic-bg">
      <header className="border-b border-clinic-line bg-white">
        <div className="container-clinic flex items-center justify-between py-4">
          <span className="font-display text-lg">Painel - Juliana Vieira</span>
          <LogoutButton />
        </div>
      </header>
      <div className="container-clinic py-10">{children}</div>
    </div>
  );
}
