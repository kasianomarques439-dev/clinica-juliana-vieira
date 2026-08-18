export default function InstagramSection() {
  const instagramUrl = "https://www.instagram.com/farmajulianavieira";

  return (
    <section className="bg-clinic-sage/10 py-16">
      <div className="container-clinic text-center">
        <p className="text-clinic-sage-dark text-sm tracking-[0.2em] uppercase mb-3">
          Instagram
        </p>
        <h2 className="font-display text-2xl md:text-3xl text-clinic-ink mb-6">
          Acompanhe os bastidores e resultados
        </h2>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-clinic bg-clinic-ink px-7 py-3 text-white text-sm hover:bg-clinic-ink/90 transition-colors"
        >
          @farmajulianavieira
        </a>
      </div>
    </section>
  );
}
