export default function Hero() {
  return (
    <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden bg-clinic-ink">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-poster.jpg"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-clinic-ink/80 via-clinic-ink/30 to-clinic-ink/50" />

      <div className="relative z-10 flex h-full items-end">
        <div className="container-clinic pb-20">
          <p className="text-white/80 text-sm tracking-[0.2em] uppercase mb-4">
            Farmaceutica Esteta
          </p>
          <h1 className="font-display text-white text-4xl md:text-6xl leading-tight max-w-2xl">
            Ciencia farmaceutica a servico da sua pele
          </h1>
          <p className="text-white/85 max-w-xl mt-5 text-base md:text-lg">
            Procedimentos personalizados, seguros e conduzidos por uma
            farmaceutica esteta. Agende sua avaliacao em poucos minutos.
          </p>
          <a
            href="#agendar"
            className="inline-block mt-8 rounded-clinic bg-clinic-clay px-7 py-3 text-white text-sm tracking-wide hover:bg-clinic-clay/90 transition-colors"
          >
            Agendar minha avaliacao
          </a>
        </div>
      </div>
    </section>
  );
}
