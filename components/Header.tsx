"use client";

import { useState } from "react";
import Image from "next/image";

const LINKS = [
  { label: "Procedimentos", href: "#procedimentos" },
  { label: "Agendar", href: "#agendar" },
  { label: "Localizacao", href: "#localizacao" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="container-clinic flex items-center justify-between py-6">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/images/logo.svg"
            alt="Juliana Vieira Farmaceutica Esteta"
            width={44}
            height={44}
            priority
          />
          <span className="font-display text-lg tracking-wide text-white">
            Juliana Vieira
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/90 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#agendar"
            className="rounded-clinic border border-white/70 px-5 py-2 text-sm text-white hover:bg-white hover:text-clinic-ink transition-colors"
          >
            Agendar avaliacao
          </a>
        </nav>

        <button
          className="md:hidden text-white"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-clinic-ink/95 px-6 pb-6 flex flex-col gap-4">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-white text-base"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
