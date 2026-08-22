"use client";

export default function WhatsAppButton() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (!whatsappNumber) {
    return null;
  }

  const message =
    "Olá! Gostaria de mais informações sobre os procedimentos e agendamento.";

  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Clínica Juliana Vieira pelo WhatsApp"
      className="
        group
        fixed
        bottom-5
        right-4
        z-[60]
        flex
        min-h-[58px]
        items-center
        justify-center
        gap-2.5
        rounded-full
        border-[3px]
        border-white
        bg-[#25D366]
        px-[15px]
        text-white
        shadow-[0_14px_35px_rgba(25,120,60,0.30)]
        transition-all
        duration-300

        hover:-translate-y-1
        hover:bg-[#20bd5a]
        hover:shadow-[0_18px_38px_rgba(25,120,60,0.38)]

        sm:bottom-6
        sm:right-6

        md:min-h-[62px]
        md:px-5
      "
    >
      <span
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
        "
      >
        <svg
          viewBox="0 0 32 32"
          fill="currentColor"
          aria-hidden="true"
          className="
            h-8
            w-8
            transition-transform
            duration-300
            group-hover:scale-105
          "
        >
          <path d="M19.11 17.21c-.29-.15-1.71-.84-1.97-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.9 1.13-.17.19-.33.22-.62.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.59.13-.13.29-.33.43-.5.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.43s1.03 2.81 1.17 3c.15.19 2.03 3.1 4.91 4.35.69.3 1.22.47 1.64.6.69.22 1.31.19 1.8.12.55-.08 1.71-.7 1.95-1.38.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34Z" />

          <path d="M16.03 3C8.84 3 3 8.84 3 16.03c0 2.29.6 4.54 1.73 6.51L3 29l6.62-1.69a12.98 12.98 0 0 0 6.4 1.64h.01C23.22 28.95 29 23.12 29 16.03 29 8.84 23.22 3 16.03 3Zm0 23.75h-.01a10.8 10.8 0 0 1-5.51-1.51l-.39-.23-3.93 1 1.05-3.83-.25-.39a10.75 10.75 0 0 1-1.66-5.76c0-5.91 4.81-10.72 10.73-10.72 5.9 0 10.7 4.81 10.7 10.72 0 5.91-4.8 10.72-10.73 10.72Z" />
        </svg>
      </span>

      <span
        className="
          hidden
          whitespace-nowrap
          pr-1
          text-[13px]
          font-bold
          md:block
        "
      >
        Fale pelo WhatsApp
      </span>
    </a>
  );
}