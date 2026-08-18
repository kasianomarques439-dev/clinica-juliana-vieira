export default function Footer() {
  return (
    <footer className="border-t border-clinic-line py-10">
      <div id="lgpd" className="container-clinic mb-10 text-sm text-clinic-ink/60 max-w-2xl">
        <h3 className="font-display text-base text-clinic-ink mb-2">
          Privacidade e LGPD
        </h3>
        <p>
          Coletamos apenas nome, celular e CPF para confirmar e gerenciar seu
          agendamento, conforme a Lei Geral de Protecao de Dados (Lei
          13.709/2018). Esses dados nao sao compartilhados com terceiros e
          ficam protegidos por controle de acesso restrito a administracao da
          clinica. Voce pode solicitar a exclusao dos seus dados a qualquer
          momento pelo Instagram da clinica.
        </p>
      </div>
      <div className="container-clinic flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-clinic-ink/60">
        <p>&copy; {new Date().getFullYear()} Juliana Vieira - Farmaceutica Esteta</p>
        <p>
          Seus dados sao tratados conforme a{" "}
          <a href="#lgpd" className="underline">
            nossa politica de privacidade (LGPD)
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
