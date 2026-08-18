"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Procedure,
  ProcedureInsert,
  ProcedureUpdate,
} from "@/types/database";

export default function ProceduresManager() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const loadProcedures = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error: loadError } = await supabase
      .from("procedures")
      .select("*")
      .order("display_order", { ascending: true });

    if (loadError) {
      console.error(
        "Erro ao carregar procedimentos:",
        loadError
      );

      setError("Não foi possível carregar os procedimentos.");
      setProcedures([]);
      setLoading(false);
      return;
    }

    setProcedures(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadProcedures();
  }, [loadProcedures]);

  async function handleCreate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError(null);

    const procedureName = name.trim();

    if (!procedureName) {
      setError("Informe o nome do procedimento.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const newProcedure: ProcedureInsert = {
      name: procedureName,
      short_description: shortDescription.trim(),
      description: description.trim(),
      image_url: imageUrl.trim() || null,
      is_active: true,
    };

    const { error: insertError } = await supabase
      .from("procedures")
      .insert(newProcedure);

    if (insertError) {
      console.error(
        "Erro ao cadastrar procedimento:",
        insertError
      );

      setError("Não foi possível salvar o procedimento.");
      setSaving(false);
      return;
    }

    setName("");
    setShortDescription("");
    setDescription("");
    setImageUrl("");
    setSaving(false);

    await loadProcedures();
  }

  async function toggleActive(procedure: Procedure) {
    setError(null);

    const supabase = createClient();

    const changes: ProcedureUpdate = {
      is_active: !procedure.is_active,
    };

    const { error: updateError } = await supabase
      .from("procedures")
      .update(changes)
      .eq("id", procedure.id);

    if (updateError) {
      console.error(
        "Erro ao alterar procedimento:",
        updateError
      );

      setError("Não foi possível alterar o procedimento.");
      return;
    }

    await loadProcedures();
  }

  async function removeProcedure(procedure: Procedure) {
    const confirmed = window.confirm(
      `Deseja realmente excluir "${procedure.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("procedures")
      .delete()
      .eq("id", procedure.id);

    if (deleteError) {
      console.error(
        "Erro ao excluir procedimento:",
        deleteError
      );

      setError("Não foi possível excluir o procedimento.");
      return;
    }

    await loadProcedures();
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section>
        <h3 className="mb-4 font-display text-xl text-[#6f4590]">
          Novo procedimento
        </h3>

        <form
          onSubmit={handleCreate}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="procedure-name"
              className="mb-1 block text-sm"
            >
              Nome do procedimento
            </label>

            <input
              id="procedure-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ex.: Preenchimento Labial"
              className="w-full rounded-xl border border-[#76509a]/20 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="procedure-short-description"
              className="mb-1 block text-sm"
            >
              Descrição curta
            </label>

            <input
              id="procedure-short-description"
              type="text"
              value={shortDescription}
              onChange={(event) =>
                setShortDescription(event.target.value)
              }
              placeholder="Ex.: Volume, contorno e definição dos lábios."
              className="w-full rounded-xl border border-[#76509a]/20 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="procedure-description"
              className="mb-1 block text-sm"
            >
              Descrição completa
            </label>

            <textarea
              id="procedure-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Descrição completa do procedimento..."
              rows={5}
              className="w-full rounded-xl border border-[#76509a]/20 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="procedure-image"
              className="mb-1 block text-sm"
            >
              Caminho da imagem
            </label>

            <input
              id="procedure-image"
              type="text"
              value={imageUrl}
              onChange={(event) =>
                setImageUrl(event.target.value)
              }
              placeholder="/images/procedimentos/labial.png"
              className="w-full rounded-xl border border-[#76509a]/20 px-4 py-3"
            />

            <p className="mt-1 text-xs text-gray-500">
              Exemplo: /images/procedimentos/botox.png
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#76509a] px-7 py-3 font-semibold text-white transition hover:bg-[#56366f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Salvando..."
              : "Adicionar procedimento"}
          </button>
        </form>
      </section>

      <section>
        <h3 className="mb-4 font-display text-xl text-[#6f4590]">
          Procedimentos cadastrados
        </h3>

        {loading ? (
          <p className="text-sm text-gray-500">
            Carregando...
          </p>
        ) : procedures.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhum procedimento cadastrado.
          </p>
        ) : (
          <ul className="space-y-3">
            {procedures.map((procedure) => (
              <li
                key={procedure.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-[#76509a]/15 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-[#56366f]">
                    {procedure.name}
                  </p>

                  {procedure.short_description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {procedure.short_description}
                    </p>
                  )}

                  {!procedure.is_active && (
                    <p className="mt-1 text-xs text-red-500">
                      Procedimento inativo
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      void toggleActive(procedure);
                    }}
                    className="font-semibold text-[#76509a] underline"
                  >
                    {procedure.is_active
                      ? "Desativar"
                      : "Ativar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      void removeProcedure(procedure);
                    }}
                    className="font-semibold text-red-600 underline"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}