export default function InstagramSection() {
  const instagramUrl =
    "https://www.instagram.com/farmajulianavieira";

  return (
    <section
      id="instagram"
      className="relative overflow-hidden bg-[#f7efe6] py-16 sm:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#dbc5e7]/30 blur-3xl"
      />

      <div className="container-clinic relative">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-7 rounded-[28px] border border-[#76509a]/10 bg-[#fffaf4] px-6 py-9 text-center shadow-[0_18px_50px_rgba(74,45,90,0.08)] sm:px-8 md:flex-row md:text-left lg:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a77f52]">
              Instagram
            </p>

            <h2 className="mt-2 font-display text-[30px] font-semibold leading-tight text-[#56366f] sm:text-[34px]">
              Acompanhe novidades e resultados
            </h2>

            <p className="mt-3 max-w-2xl text-[14px] font-medium leading-6 text-[#746b74]">
              Veja conteúdos, bastidores e informações sobre os procedimentos
              da clínica.
            </p>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-full bg-[#704093] px-6 text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(86,48,112,0.22)] transition hover:-translate-y-0.5 hover:bg-[#5d347b]"
          >
            @farmajulianavieira

            <span
              aria-hidden="true"
              className="ml-2 text-lg"
            >
              ↗
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}