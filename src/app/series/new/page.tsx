"use client";

import { useState } from "react";
import { addSeries } from "@/actions/series";
import { Button } from "@/components/ui/button";
import { MediaSearch } from "@/components/MediaSearch";
import Link from "next/link";
import {
  ArrowLeft,
  Film,
  Sparkles,
  Tv,
  Clapperboard,
  Radio,
} from "lucide-react";

export default function NewSeriesPage() {
  // Estado para gerenciar se estamos buscando Filmes ou Séries
  const [mediaType, setMediaType] = useState<"tv" | "movie">("tv");

  const [selectedMedia, setSelectedMedia] = useState<{
    id: number;
    title: string;
    poster_path: string | null;
  } | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 text-white p-6 sm:p-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors group font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Voltar para a biblioteca
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-zinc-50 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500 fill-blue-500/20" />
            Adicionar à Estante
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Explore o catálogo global para alimentar seu catálogo individual.
          </p>
        </div>

        <div className="space-y-6 bg-zinc-900/30 border border-zinc-800/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
          {/* Seletor Dinâmico de Tipo (Filme vs Série) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              O que deseja adicionar?
            </label>
            <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800/60">
              <button
                type="button"
                onClick={() => {
                  setMediaType("tv");
                  setSelectedMedia(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${mediaType === "tv" ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"}`}
              >
                <Tv className="w-4 h-4" /> Série TV
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaType("movie");
                  setSelectedMedia(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${mediaType === "movie" ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"}`}
              >
                <Clapperboard className="w-4 h-4" /> Filme
              </button>
            </div>
          </div>

          {/* Componente de Busca por API */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Buscar por título oficial
            </label>
            <MediaSearch
              key={mediaType} // Reseta a busca se mudar de abas
              type={mediaType}
              placeholder={
                mediaType === "tv"
                  ? "Ex: How I Met Your Mother..."
                  : "Ex: Interstellar..."
              }
              onSelect={(media) => setSelectedMedia(media)}
            />
          </div>

          <form action={addSeries} className="space-y-6">
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
            <input type="hidden" name="media_type" value={mediaType} />
            <input
              type="hidden"
              name="poster_path"
              value={selectedMedia?.poster_path || ""}
            />

            {/* MEGA PREVIEW CARD: Agora grande, robusto e sem margem para dúvidas */}
            {selectedMedia && (
              <div className="flex gap-5 bg-zinc-950/80 border border-zinc-800 p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
                {selectedMedia.poster_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://image.tmdb.org/t/p/w185${selectedMedia.poster_path}`} // Aumentada a resolução para w185
                    alt={selectedMedia.title}
                    className="w-24 h-36 object-cover rounded-xl shadow-2xl border border-zinc-800 shrink-0"
                  />
                ) : (
                  <div className="w-24 h-36 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 shrink-0">
                    <Film className="w-8 h-8 text-zinc-700" />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 tracking-wider uppercase bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 w-fit">
                    {mediaType === "tv" ? (
                      <Radio className="w-3 h-3" />
                    ) : (
                      <Clapperboard className="w-3 h-3" />
                    )}
                    {mediaType === "tv"
                      ? "Série Selecionada"
                      : "Filme Selecionado"}
                  </span>
                  <h4 className="font-black text-xl text-zinc-100 leading-tight mt-2.5">
                    {selectedMedia.title}
                  </h4>
                  <p className="text-zinc-500 text-xs mt-1 font-medium">
                    Os metadados avançados e episódios serão injetados
                    automaticamente.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Status Inicial
              </label>
              <select
                name="status"
                className="w-full p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl text-sm text-zinc-200 font-bold focus:outline-none focus:border-blue-500/50"
              >
                <option value="assistindo">🎬 Assistindo agora</option>
                <option value="assistir">📌 Quero Assistir</option>
                <option value="finalizado">✅ Finalizado</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={!selectedMedia}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-extrabold rounded-xl py-6 shadow-xl transition-all duration-200 tracking-wide text-base"
            >
              Confirmar e Salvar na Estante
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
