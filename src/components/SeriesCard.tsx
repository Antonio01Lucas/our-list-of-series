"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  updateSeriesProgress,
  updateSeriesRating,
  deleteSeries,
} from "@/actions/series";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Film,
  Play,
  CheckCircle2,
  Bookmark,
  Star,
  CalendarDays,
  Clapperboard,
  Loader2,
  Clock,
  Trash2,
} from "lucide-react";

interface Serie {
  id: string | number;
  title: string;
  status: string;
  media_type: string;
  tmdb_id?: number | null;
  poster_path?: string | null;
  genres?: string[] | null;
  is_in_production?: boolean;
  current_season: number;
  current_episode: number;
  total_seasons?: number;
  total_episodes?: number;
  rating?: number | null;
  runtime?: number;
}

interface SeasonDetail {
  season_number: number;
  episode_count: number;
}

export function SeriesCard({ serie }: { serie: Serie }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasBeenDeleted, setHasBeenDeleted] = useState(false);

  const isMovie = serie.media_type === "movie";
  const [selectedSeason, setSelectedSeason] = useState<number>(
    serie.current_season || 1,
  );

  const { data: seasonsData, isLoading: isLoadingSeasons } = useQuery<{
    seasons: SeasonDetail[];
  }>({
    queryKey: ["seriesSeasons", serie.tmdb_id],
    queryFn: async () => {
      const res = await fetch(`/api/series/seasons?tmdb_id=${serie.tmdb_id}`);
      if (!res.ok) throw new Error("Erro ao coletar dados");
      return res.json();
    },
    enabled: open && !isMovie && !!serie.tmdb_id,
  });

  const currentSeasonInfo = seasonsData?.seasons?.find(
    (s) => s.season_number === selectedSeason,
  );
  const maxEpisodesForSelectedSeason = currentSeasonInfo
    ? currentSeasonInfo.episode_count
    : 24;

  async function handleDelete() {
    if (
      confirm(
        `Tem certeza que deseja remover "${serie.title}" da sua biblioteca?`,
      )
    ) {
      setIsDeleting(true);
      try {
        await deleteSeries(serie.id); // Passa o ID original sem conversões arriscadas
        setHasBeenDeleted(true);
        router.refresh();
      } catch (err) {
        console.error(err);
        setIsDeleting(false);
      }
    }
  }

  async function handleSubmit(formData: FormData) {
    const season = isMovie ? 0 : Number(formData.get("season"));
    const episode = isMovie ? 0 : Number(formData.get("episode"));
    const rating = formData.get("rating")
      ? Number(formData.get("rating"))
      : null;

    await updateSeriesProgress(serie.id, {
      // Passa o ID original sem conversões arriscadas
      current_season: season,
      current_episode: episode,
    });

    if (rating !== null) {
      await updateSeriesRating(String(serie.id), rating);
    }
    setOpen(false);
  }

  if (hasBeenDeleted) {
    return null;
  }

  const renderStatusBadge = (status: string) => {
    const baseClass =
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-md";
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
    <div
      className={`flex gap-5 bg-zinc-900/20 border border-zinc-800/90 backdrop-blur-md p-5 rounded-3xl hover:border-zinc-700/80 hover:bg-zinc-900/50 transition-all duration-300 shadow-xl min-h-55 relative ${isDeleting ? "opacity-30 pointer-events-none" : ""}`}
    >
      {/* Botão de Excluir */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-4 right-4 text-zinc-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-950/40 transition-colors z-10"
        title="Remover da Biblioteca"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>

      {/* Capa/Poster */}
      {serie.poster_path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://image.tmdb.org/t/p/w154${serie.poster_path}`}
          alt={serie.title}
          className="w-24 h-36 object-cover rounded-2xl border border-zinc-800/80 shadow-md shrink-0 my-auto"
        />
      ) : (
        <div className="w-24 h-36 bg-zinc-950 rounded-2xl border border-zinc-800/60 flex items-center justify-center shrink-0 my-auto">
          {isMovie ? (
            <Clapperboard className="w-6 h-6 text-zinc-700" />
          ) : (
            <Film className="w-6 h-6 text-zinc-700" />
          )}
        </div>
      )}

      {/* Conteúdo Textual */}
      <div className="flex flex-col justify-between w-full pr-6">
        <div>
          <div className="flex flex-col gap-1 mb-2">
            <h3 className="font-extrabold text-lg text-zinc-50 tracking-tight leading-tight line-clamp-1 max-w-[85%]">
              {serie.title}
            </h3>

            <div className="flex items-center gap-3">
              {serie.runtime && serie.runtime > 0 && (
                <div className="flex items-center gap-1 text-zinc-500 text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  <span>
                    {isMovie
                      ? `${serie.runtime} min`
                      : `~${serie.runtime} min/ep`}
                  </span>
                </div>
              )}

              {serie.rating ? (
                <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                  <span>{serie.rating}/10</span>
                </div>
              ) : (
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Sem nota
                </span>
              )}
            </div>
          </div>

          <div className="mb-3">{renderStatusBadge(serie.status)}</div>

          {serie.genres && serie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {serie.genres.slice(0, 2).map((genre, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-zinc-950 text-zinc-400 font-bold border border-zinc-800/60 px-2 py-0.5 rounded-md"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {!isMovie ? (
            <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold bg-zinc-950/60 border border-zinc-800/80 w-fit px-3 py-1.5 rounded-xl mb-4">
              <span>
                T.{" "}
                <strong className="text-blue-400 font-black">
                  {serie.current_season}
                </strong>
                <span className="text-zinc-600 font-normal">
                  /{serie.total_seasons}
                </span>
              </span>
              <span className="text-zinc-700">|</span>
              <span>
                E.{" "}
                <strong className="text-blue-400 font-black">
                  {serie.current_episode}
                </strong>
                <span className="text-zinc-600 font-normal">
                  /{serie.total_episodes}
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold bg-zinc-950/40 border border-zinc-800/40 w-fit px-3 py-1.5 rounded-xl mb-4">
              <Clapperboard className="w-3.5 h-3.5 text-zinc-500" />
              <span>Filme de Longa Metragem</span>
            </div>
          )}

          {!isMovie && (
            <div className="flex items-center gap-1 text-[10px] font-bold tracking-wide mb-4">
              <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
              <span
                className={
                  serie.is_in_production
                    ? "text-emerald-400/90"
                    : "text-zinc-500"
                }
              >
                {serie.is_in_production
                  ? "Em Exibição / Lançando"
                  : "Série Encerrada / Completa"}
              </span>
            </div>
          )}
        </div>

        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (isOpen) {
              setSelectedSeason(serie.current_season || 1);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              className="w-full bg-zinc-800/60 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/40 font-bold transition-all rounded-xl py-4 h-9 text-xs"
            >
              {isMovie ? "Atribuir Nota" : "Editar Progresso & Nota"}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Atualizar {serie.title}
              </DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-5 mt-4">
              {!isMovie && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Temporada
                    </label>
                    <select
                      name="season"
                      value={selectedSeason}
                      onChange={(e) =>
                        setSelectedSeason(Number(e.target.value))
                      }
                      className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-200 focus:outline-none focus:border-blue-500"
                    >
                      {Array.from(
                        { length: serie.total_seasons || 1 },
                        (_, i) => i + 1,
                      ).map((num) => (
                        <option key={num} value={num}>
                          Temporada {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      Episódio
                      {isLoadingSeasons && (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                      )}
                    </label>
                    <select
                      name="episode"
                      defaultValue={serie.current_episode}
                      disabled={isLoadingSeasons}
                      className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      {Array.from(
                        { length: maxEpisodesForSelectedSeason },
                        (_, i) => i + 1,
                      ).map((num) => (
                        <option key={num} value={num}>
                          Episódio {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Sua Nota Avaliativa
                </label>
                <select
                  name="rating"
                  defaultValue={serie.rating || ""}
                  className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Deixar sem nota</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      ⭐ {num} / 10
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
    </div>
  );
}
