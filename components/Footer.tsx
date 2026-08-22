export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#4f315f] text-white">
      {/* DETALHES DE FUNDO */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#76509a]/30 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#ead9b6]/10 blur-3xl"
      />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container-clinic relative py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* MARCA */}
          <div className="lg:col-span-1">
            <a
              href="#inicio"
              className="inline-flex items-center gap-3"
              aria-label="Juliana Vieira - Início"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[15px] border border-white/20 bg-white/10 shadow-sm">
                <span className="font-display text-xl font-semibold">
                  JV
                </span>
              </div>

              <div>
                <p className="font-display text-xl font-semibold leading-none">
                  Juliana Vieira
                </p>

                <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.20em] text-[#ead9b6]">
                  Farmacêutica Esteta
                </p>
              </div>
            </a>

            <p className="mt-5 max-w-xs text-[13px] leading-6 text-white/65">
              Cuidado, segurança e atenção em cada detalhe para valorizar sua
              beleza de forma natural e personalizada.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-[#ead9b6]">
              Navegação
            </p>

            <nav className="mt-4 flex flex-col items-start gap-3">
              <a
                href="#inicio"
                className="text-sm text-white/70 transition hover:text-white"
              >
                Início
              </a>

              <a
                href="#procedimentos"
                className="text-sm text-white/70 transition hover:text-white"
              >
                Procedimentos
              </a>

              <a
                href="#agendar"
                className="text-sm text-white/70 transition hover:text-white"
              >
                Agendamento
              </a>

              <a
                href="#instagram"
                className="text-sm text-white/70 transition hover:text-white"
              >
                Instagram
              </a>
            </nav>
          </div>

          {/* HORÁRIOS */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-[#ead9b6]">
              Atendimento
            </p>

            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div>
                <p className="font-semibold text-white/90">
                  Segunda a sábado
                </p>

                <p className="mt-1">
                  09:00 às 22:00
                </p>
              </div>

              <div>
                <p className="font-semibold text-white/90">
                  Domingo
                </p>

                <p className="mt-1">
                  Fechado
                </p>
              </div>
            </div>

            <a
              href="#agendar"
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 text-[12px] font-bold text-white transition hover:bg-white hover:text-[#56366f]"
            >
              Agendar horário
              <span
                aria-hidden="true"
                className="ml-2"
              >
                →
              </span>
            </a>
          </div>

          {/* PRIVACIDADE */}
          <div id="lgpd">
            <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-[#ead9b6]">
              Privacidade
            </p>

            <h3 className="mt-3 font-display text-xl font-semibold">
              Privacidade e LGPD
            </h3>

            <p className="mt-3 text-[13px] leading-6 text-white/65">
              Os dados informados durante o agendamento são utilizados
              exclusivamente para confirmação e gestão do atendimento.
            </p>

            <p className="mt-3 text-[12px] leading-5 text-white/45">
              Tratamento de dados conforme a Lei Geral de Proteção de Dados
              (Lei 13.709/2018).
            </p>
          </div>
        </div>
      </div>

      {/* RODAPÉ INFERIOR */}
      <div className="relative border-t border-white/10">
        <div className="container-clinic flex flex-col gap-3 py-6 text-[11px] text-white/50 sm:text-[12px] md:flex-row md:items-center md:justify-between">
          <p>
            © {currentYear} Juliana Vieira - Farmacêutica Esteta. Todos os
            direitos reservados.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href="#lgpd"
              className="font-semibold text-white/60 transition hover:text-white"
            >
              Privacidade e LGPD
            </a>

            <a
              href="#inicio"
              className="font-semibold text-white/60 transition hover:text-white"
            >
              Voltar ao topo ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}