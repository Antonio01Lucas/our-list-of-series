"use client";

import { useState } from "react";
import { updateSeriesProgress, updateSeriesRating } from "@/actions/series"; // Importada a action de nota
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film, Play, CheckCircle2, Bookmark, Star } from "lucide-react"; // Adicionado o ícone Star

interface Serie {
  id: string | number;
  title: string;
  status: string;
  current_season: number;
  current_episode: number;
  rating?: number | null; // Nova propriedade mapeada do banco
}

export function SeriesCard({ serie }: { serie: Serie }) {
  const [open, setOpen] = useState(false);
  const numericId = Number(serie.id);

  async function handleSubmit(formData: FormData) {
    const season = Number(formData.get("season"));
    const episode = Number(formData.get("episode"));
    const rating = formData.get("rating")
      ? Number(formData.get("rating"))
      : null;

    // 1. Atualiza o progresso de temporada e episódio
    await updateSeriesProgress(numericId, {
      current_season: season,
      current_episode: episode,
    });

    // 2. Atualiza a nota se ela tiver sido selecionada
    if (rating !== null) {
      await updateSeriesRating(String(serie.id), rating);
    }

    setOpen(false);
  }

  const renderStatusBadge = (status: string) => {
    const baseClass =
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-md";
    switch (status.toLowerCase()) {
      case "assistindo":
        return (
          <span
            className={`${baseClass} bg-amber-500/10 text-amber-400 border border-amber-500/20`}
          >
            <Play className="w-3 h-3 fill-amber-400" /> Assistindo
          </span>
        );
      case "finalizado":
        return (
          <span
            className={`${baseClass} bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}
          >
            <CheckCircle2 className="w-3 h-3" /> Finalizado
          </span>
        );
      default:
        return (
          <span
            className={`${baseClass} bg-blue-500/10 text-blue-400 border border-blue-500/20`}
          >
            <Bookmark className="w-3 h-3" /> Quero Assistir
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col justify-between bg-zinc-900/30 border border-zinc-800/90 backdrop-blur-md p-8 rounded-3xl hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all duration-300 shadow-2xl shadow-black/30 min-h-62.5">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="space-y-1.5 max-w-[70%]">
            <h3 className="font-extrabold text-2xl text-zinc-50 tracking-tight leading-tight line-clamp-2">
              {serie.title}
            </h3>

            {/* Exibição da Nota Estilizada na Dashboard */}
            {serie.rating ? (
              <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                <span>{serie.rating}/10</span>
              </div>
            ) : (
              <span className="text-xs text-zinc-500 font-medium block">
                Sem nota atribuída
              </span>
            )}
          </div>

          <div className="w-fit">{renderStatusBadge(serie.status)}</div>
        </div>

        <div className="flex items-center gap-2.5 text-sm text-zinc-300 font-semibold bg-zinc-950/60 border border-zinc-800/80 w-fit px-4 py-2 rounded-xl mb-8">
          <Film className="w-4 h-4 text-zinc-400" />
          <span>
            Temporada{" "}
            <strong className="text-blue-400 text-base">
              {serie.current_season || 1}
            </strong>
          </span>
          <span className="text-zinc-700">|</span>
          <span>
            Episódio{" "}
            <strong className="text-blue-400 text-base">
              {serie.current_episode || 1}
            </strong>
          </span>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            className="w-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/50 font-bold tracking-wide transition-all duration-200 rounded-xl py-6 text-sm"
          >
            Editar Progresso & Nota
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              Atualizar {serie.title}
            </DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-5 mt-4">
            {/* Grid de Temporada e Episódio */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Temporada
                </label>
                <Input
                  name="season"
                  type="number"
                  defaultValue={serie.current_season || 1}
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500 rounded-xl py-5 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Episódio
                </label>
                <Input
                  name="episode"
                  type="number"
                  defaultValue={serie.current_episode || 1}
                  className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500 rounded-xl py-5 font-bold"
                />
              </div>
            </div>

            {/* Novo Campo: Seletor de Nota (1 a 10) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Sua Nota (Algoritmo de IA)
              </label>
              <select
                name="rating"
                defaultValue={serie.rating || ""}
                className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">Deixar sem nota</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    ⭐ {num} / 10{" "}
                    {num >= 8
                      ? " - Excelente!"
                      : num >= 5
                        ? " - Ok"
                        : " - Ruim"}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="mt-8">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl py-6 transition-colors tracking-wide"
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
