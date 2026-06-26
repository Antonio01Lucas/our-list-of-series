"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MediaSearch } from "@/components/MediaSearch";
import {
  Film,
  Tv,
  User as UserIcon,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Plus,
  Clapperboard,
  Tv2,
} from "lucide-react";

interface SelectedMedia {
  tmdb_id: string;
  title: string;
  poster_path?: string | null;
}

export default function OnboardingQuestionsPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estados do Questionário
  const [movies, setMovies] = useState<SelectedMedia[]>([]);
  const [series, setSeries] = useState<SelectedMedia[]>([]);
  const [actors, setActors] = useState<string[]>([]);
  const [directors, setDirectors] = useState<string[]>([]);

  const progressValue = step === 1 ? 33 : step === 2 ? 66 : 100;

  const addMovie = (media: {
    id: string;
    title: string;
    poster_path?: string | null;
  }) => {
    if (movies.length >= 5) return;
    if (movies.some((m) => m.tmdb_id === media.id)) return;
    setMovies([
      ...movies,
      { tmdb_id: media.id, title: media.title, poster_path: media.poster_path },
    ]);
  };

  const addSeries = (media: {
    id: string;
    title: string;
    poster_path?: string | null;
  }) => {
    if (series.length >= 5) return;
    if (series.some((s) => s.tmdb_id === media.id)) return;
    setSeries([
      ...series,
      { tmdb_id: media.id, title: media.title, poster_path: media.poster_path },
    ]);
  };

  const addActorTag = (name: string) => {
    if (!name.trim() || actors.includes(name.trim())) return;
    setActors([...actors, name.trim()]);
  };

  const addDirectorTag = (name: string) => {
    if (!name.trim() || directors.includes(name.trim())) return;
    setDirectors([...directors, name.trim()]);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await saveOnboardingData({
        favorite_actors: actors,
        favorite_directors: directors,
      });
      router.push("/");
    } catch (error) {
      console.error("Erro ao salvar onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between p-6 sm:p-12 relative selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />

      {/* Header com Progresso */}
      <header className="max-w-3xl w-full mx-auto space-y-4 relative z-10">
        <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Clapperboard className="w-4 h-4 text-blue-500" />
            <span>SyncWatch Calibration</span>
          </div>
          <span>Passo {step} de 3</span>
        </div>
        <Progress
          value={progressValue}
          className="h-2 bg-zinc-900 border border-zinc-800/50"
        />
      </header>

      {/* Corpo do Wizard */}
      <main className="max-w-3xl w-full mx-auto my-12 bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10 flex-1 flex flex-col justify-center">
        {/* PASSO 1: FILMES FAVORITOS */}
        {step === 1 && (
          <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                <Film className="w-7 h-7 text-blue-400" />
                Quais seus <span className="text-blue-400">5 filmes</span>{" "}
                favoritos?
              </h2>
              <p className="text-zinc-400 text-sm">
                Busque e selecione até 5 filmes que definem o seu gosto
                cinematográfico.
              </p>
            </div>

            <div className="pt-2">
              <MediaSearch
                type="movie"
                placeholder="Pesquisar filme no catálogo..."
                onSelect={(media) =>
                  addMovie({
                    id: media.id.toString(),
                    title: media.title,
                    poster_path: media.poster_path,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4">
              {movies.map((movie) => (
                <div
                  key={movie.tmdb_id}
                  className="group aspect-2/3 bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden shadow-md hover:border-zinc-700 transition duration-300"
                >
                  {movie.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full p-3 flex items-center justify-center text-center text-[10px] font-bold text-zinc-500">
                      {movie.title}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <button
                    onClick={() =>
                      setMovies(
                        movies.filter((m) => m.tmdb_id !== movie.tmdb_id),
                      )
                    }
                    className="absolute top-2 right-2 w-6 h-6 bg-zinc-950/80 hover:bg-red-600 rounded-full flex items-center justify-center border border-zinc-800/80 backdrop-blur-md transition text-zinc-300 hover:text-white z-20 shadow-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {Array.from({ length: 5 - movies.length }).map((_, idx) => (
                <div
                  key={idx}
                  className="border-2 border-dashed border-zinc-800/60 rounded-2xl flex items-center justify-center aspect-2/3 text-zinc-800/80 hover:text-zinc-700 hover:border-zinc-700/60 transition duration-300"
                >
                  <Plus className="w-6 h-6" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSO 2: SÉRIES FAVORITAS */}
        {step === 2 && (
          <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                <Tv className="w-7 h-7 text-purple-400" />E quais as suas{" "}
                <span className="text-purple-400">5 séries</span> preferidas?
              </h2>
              <p className="text-zinc-400 text-sm">
                O algoritmo lerá os gêneros e formatos dessas produções para
                calibrar sua estante.
              </p>
            </div>

            <div className="pt-2">
              <MediaSearch
                type="tv"
                placeholder="Pesquisar série no catálogo..."
                onSelect={(media) =>
                  addSeries({
                    id: media.id.toString(),
                    title: media.title,
                    poster_path: media.poster_path,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4">
              {series.map((item) => (
                <div
                  key={item.tmdb_id}
                  className="group aspect-2/3 bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden shadow-md hover:border-zinc-700 transition duration-300"
                >
                  {item.poster_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full p-3 flex items-center justify-center text-center text-[10px] font-bold text-zinc-500">
                      {item.title}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <button
                    onClick={() =>
                      setSeries(
                        series.filter((s) => s.tmdb_id !== item.tmdb_id),
                      )
                    }
                    className="absolute top-2 right-2 w-6 h-6 bg-zinc-950/80 hover:bg-red-600 rounded-full flex items-center justify-center border border-zinc-800/80 backdrop-blur-md transition text-zinc-300 hover:text-white z-20 shadow-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {Array.from({ length: 5 - series.length }).map((_, idx) => (
                <div
                  key={idx}
                  className="border-2 border-dashed border-zinc-800/60 rounded-2xl flex items-center justify-center aspect-2/3 text-zinc-800/80 hover:text-zinc-700 hover:border-zinc-700/60 transition duration-300"
                >
                  <Plus className="w-6 h-6" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSO 3: ATORES E DIRETORES — AGORA COM LARGURA COMPLETA TOTAL (STACKED) */}
        {step === 3 && (
          <div className="space-y-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                <UserIcon className="w-7 h-7 text-amber-400" />
                Quem comanda a tela?
              </h2>
              <p className="text-zinc-400 text-sm">
                Busque e selecione os astros e cineastas que fazem você assistir
                a um projeto.
              </p>
            </div>

            {/* Layout empilhado em space-y-8 garante largura 100% igual aos Passos 1 e 2 */}
            <div className="space-y-8">
              {/* Bloco 1: Atores (Largura Máxima) */}
              <div className="space-y-3.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5 text-zinc-500" /> Atores /
                  Atrizes favoritos
                </label>
                <MediaSearch
                  type="person"
                  placeholder="Buscar ator ou atriz no catálogo global..."
                  onSelect={(media) => addActorTag(media.title)}
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {actors.map((actor) => (
                    <span
                      key={actor}
                      className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-xl transition hover:border-blue-500/40 animate-in zoom-in-95 duration-200"
                    >
                      {actor}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-white transition-colors"
                        onClick={() =>
                          setActors(actors.filter((a) => a !== actor))
                        }
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Bloco 2: Diretores (Largura Máxima) */}
              <div className="space-y-3.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Tv2 className="w-3.5 h-3.5 text-zinc-500" /> Diretores
                  favoritos
                </label>
                <MediaSearch
                  type="person"
                  placeholder="Buscar cineasta ou diretor pelo nome..."
                  onSelect={(media) => addDirectorTag(media.title)}
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {directors.map((dir) => (
                    <span
                      key={dir}
                      className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-xl transition hover:border-amber-500/40 animate-in zoom-in-95 duration-200"
                    >
                      {dir}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-white transition-colors"
                        onClick={() =>
                          setDirectors(directors.filter((d) => d !== dir))
                        }
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer com Navegação de Botões */}
      <footer className="max-w-3xl w-full mx-auto flex justify-between items-center relative z-10">
        <Button
          onClick={() => setStep(step - 1)}
          disabled={step === 1 || loading}
          variant="outline"
          className="border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-bold rounded-xl gap-2 px-4 py-5 text-xs uppercase tracking-wider disabled:opacity-0 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 ? movies.length === 0 : series.length === 0}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl gap-2 px-5 py-5 tracking-wide text-xs uppercase"
          >
            Avançar <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl gap-2 px-6 py-5 tracking-wide text-xs uppercase shadow-lg shadow-emerald-900/20 transition-all duration-300"
          >
            {loading ? "Salvando..." : "Concluir Calibração"}
            <Check className="w-4 h-4 stroke-3" />
          </Button>
        )}
      </footer>
    </div>
  );
}
