"use client";

import { useState } from "react";
import { updateSeriesProgress } from "@/actions/series";
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
import { Film, Play, CheckCircle2, Bookmark } from "lucide-react";

interface Serie {
  id: string | number;
  title: string;
  status: string;
  current_season: number;
  current_episode: number;
}

export function SeriesCard({ serie }: { serie: Serie }) {
  const [open, setOpen] = useState(false);
  const numericId = Number(serie.id);

  async function handleSubmit(formData: FormData) {
    const season = Number(formData.get("season"));
    const episode = Number(formData.get("episode"));

    await updateSeriesProgress(numericId, {
      current_season: season,
      current_episode: episode,
    });
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
    <div className="flex flex-col justify-between bg-zinc-900/30 border border-zinc-800/90 backdrop-blur-md p-8 rounded-3xl hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all duration-300 shadow-2xl shadow-black/30 min-h-[240px]">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Título maior (text-2xl) e com tracking mais elegante */}
          <h3 className="font-extrabold text-2xl text-zinc-50 tracking-tight leading-tight line-clamp-2 max-w-[70%]">
            {serie.title}
          </h3>
          <div className="w-fit">{renderStatusBadge(serie.status)}</div>
        </div>

        {/* Marcador de progresso expandido e mais visível */}
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
            Editar Progresso
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              Atualizar {serie.title}
            </DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-5 mt-4">
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
