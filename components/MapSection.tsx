export default function MapSection() {
  const mapsUrl = "https://maps.app.goo.gl/YozREDxkC5rky5Jw6";

  return (
    <section id="localizacao" className="container-clinic pb-20 md:pb-28">
      <p className="text-clinic-sage-dark text-sm tracking-[0.2em] uppercase mb-3">
        Onde estamos
      </p>
      <h2 className="font-display text-3xl md:text-4xl text-clinic-ink mb-8">
        Localizacao
      </h2>

      <div className="overflow-hidden rounded-clinic border border-clinic-line">
        <iframe
          title="Localizacao da clinica no Google Maps"
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            mapsUrl
          )}&output=embed`}
          width="100%"
          height="380"
          loading="lazy"
          style={{ border: 0 }}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-sm text-clinic-sage-dark underline"
      >
        Abrir no Google Maps
      </a>
    </section>
  );
}
