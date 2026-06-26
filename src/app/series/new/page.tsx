"use client";

import { useState } from "react";
import { addSeries } from "@/actions/series";
import { Button } from "@/components/ui/button";
import { MediaSearch } from "@/components/MediaSearch";
import Link from "next/link";
import { ArrowLeft, Film, Sparkles } from "lucide-react";

export default function NewSeriesPage() {
  // CORREÇÃO: Alinhamos a tipografia do estado para aceitar 'string | null'
  const [selectedMedia, setSelectedMedia] = useState<{
    id: number;
    title: string;
    poster_path: string | null;
  } | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 text-white p-6 sm:p-12">
      <div className="max-w-xl mx-auto">
        {/* Voltar */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors group font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Voltar para a biblioteca
          </Link>
        </div>

        {/* Título da Página */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-zinc-50 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500 fill-blue-500/20" />
            Adicionar à Estante
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Pesquise pelo título oficial para indexar o progresso no seu
            algoritmo.
          </p>
        </div>

        <div className="space-y-6 bg-zinc-900/30 border border-zinc-800/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
          {/* 1. Componente de Busca por API */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Buscar Título da Série
            </label>
            <MediaSearch
              type="tv"
              placeholder="Digite o nome da série (ex: Succession)..."
              onSelect={(media) => setSelectedMedia(media)}
            />
          </div>

          {/* Formulário de Envio para o Banco */}
          <form action={addSeries} className="space-y-6">
            {/* Inputs Ocultos para enviar os dados coletados da API via FormData */}
            <input
              type="hidden"
              name="title"
              value={selectedMedia?.title || ""}
            />
            <input
              type="hidden"
              name="tmdb_id"
              value={selectedMedia?.id || ""}
            />

            {/* Preview Visual da Série Selecionada */}
            {selectedMedia && (
              <div className="flex items-center gap-4 bg-zinc-950/60 border border-zinc-800/60 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                {selectedMedia.poster_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://image.tmdb.org/t/p/w92${selectedMedia.poster_path}`}
                    alt={selectedMedia.title}
                    className="w-14 h-20 object-cover rounded-xl shadow-md border border-zinc-800"
                  />
                ) : (
                  <div className="w-14 h-20 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                    <Film className="w-5 h-5 text-zinc-600" />
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-blue-400 tracking-wide uppercase">
                    Selecionado
                  </span>
                  <h4 className="font-extrabold text-lg text-zinc-200 leading-tight mt-0.5">
                    {selectedMedia.title}
                  </h4>
                </div>
              </div>
            )}

            {/* Menu de Status */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Status Inicial
              </label>
              <select
                name="status"
                className="w-full p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 font-medium focus:outline-none focus:border-blue-500/50 transition-colors"
              >
                <option value="assistir">Quero Assistir</option>
                <option value="assistindo">Assistindo</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>

            {/* Botão de Envio */}
            <Button
              type="submit"
              disabled={!selectedMedia}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-extrabold rounded-xl py-6 shadow-xl shadow-blue-600/5 transition-all duration-200 tracking-wide"
            >
              Confirmar e Adicionar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
