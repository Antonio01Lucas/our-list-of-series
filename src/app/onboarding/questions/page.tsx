"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

// Tipagem para os itens selecionados do TMDB
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

  // Estados temporários para inputs de texto (Passo 3)
  const [currentActor, setCurrentActor] = useState("");
  const [currentDirector, setCurrentDirector] = useState("");

  // Progresso da barra (3 passos = 33%, 66%, 100%)
  const progressValue = step === 1 ? 33 : step === 2 ? 66 : 100;

  // Handlers para adicionar mídias (máximo 5)
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

  // Handlers para tags de texto (Atores e Diretores)
  const addActor = () => {
    if (!currentActor.trim() || actors.includes(currentActor.trim())) return;
    setActors([...actors, currentActor.trim()]);
    setCurrentActor("");
  };

  const addDirector = () => {
    if (!currentDirector.trim() || directors.includes(currentDirector.trim()))
      return;
    setDirectors([...directors, currentDirector.trim()]);
    setCurrentDirector("");
  };

  // Envio final dos dados para o Supabase
  const handleSubmit = async () => {
    setLoading(false);
    try {
      setLoading(true);

      // Chamamos a Server Action que criamos anteriormente
      await saveOnboardingData({
        favorite_actors: actors,
        favorite_directors: directors,
        // Dica: Se quiser salvar os filmes/séries em lote nas tabelas de relacionamento,
        // passaremos esses arrays para a action processar no banco.
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
                cinematográfico[cite: 1306].
              </p>
            </div>

            {/* Componente de Busca Reutilizado */}
            <div className="pt-2">
              <MediaSearch
                type="movie"
                onSelect={(media) =>
                  addMovie({
                    id: media.id.toString(),
                    title: media.title,
                    poster_path: media.poster_path,
                  })
                }
              />
            </div>

            {/* Grid de Escolhas */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
              {movies.map((movie) => (
                <div
                  key={movie.tmdb_id}
                  className="group bg-zinc-950 border border-zinc-800 rounded-xl p-3 relative flex flex-col items-center justify-between text-center min-h-25 hover:border-zinc-700 transition"
                >
                  <button
                    onClick={() =>
                      setMovies(
                        movies.filter((m) => m.tmdb_id !== movie.tmdb_id),
                      )
                    }
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-800 hover:bg-red-500 rounded-full flex items-center justify-center border border-zinc-700 transition text-zinc-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-zinc-300 line-clamp-3 my-auto px-1">
                    {movie.title}
                  </span>
                </div>
              ))}
              {Array.from({ length: 5 - movies.length }).map((_, idx) => (
                <div
                  key={idx}
                  className="border border-dashed border-zinc-800 rounded-xl flex items-center justify-center min-h-25 text-zinc-700"
                >
                  <Plus className="w-5 h-5" />
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
                calibrar sua estante[cite: 1307].
              </p>
            </div>

            <div className="pt-2">
              <MediaSearch
                type="tv"
                onSelect={(media) =>
                  addSeries({
                    id: media.id.toString(),
                    title: media.title,
                    poster_path: media.poster_path,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
              {series.map((item) => (
                <div
                  key={item.tmdb_id}
                  className="group bg-zinc-950 border border-zinc-800 rounded-xl p-3 relative flex flex-col items-center justify-between text-center min-h-25 hover:border-zinc-700 transition"
                >
                  <button
                    onClick={() =>
                      setSeries(
                        series.filter((s) => s.tmdb_id !== item.tmdb_id),
                      )
                    }
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-800 hover:bg-red-500 rounded-full flex items-center justify-center border border-zinc-700 transition text-zinc-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-zinc-300 line-clamp-3 my-auto px-1">
                    {item.title}
                  </span>
                </div>
              ))}
              {Array.from({ length: 5 - series.length }).map((_, idx) => (
                <div
                  key={idx}
                  className="border border-dashed border-zinc-800 rounded-xl flex items-center justify-center min-h-25 text-zinc-700"
                >
                  <Plus className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSO 3: ATORES E DIRETORES */}
        {step === 3 && (
          <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                <UserIcon className="w-7 h-7 text-amber-400" />
                Quem comanda a tela?
              </h2>
              <p className="text-zinc-400 text-sm">
                Adicione os nomes dos atores, atrizes ou diretores que fazem
                você assistir a um projeto[cite: 1307].
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Seção Atores */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Atores / Atrizes favoritos [cite: 1307]
                </label>
                <div className="flex gap-2">
                  <Input
                    value={currentActor}
                    onChange={(e) => setCurrentActor(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addActor()}
                    placeholder="Ex: Al Pacino, Meryl Streep..."
                    className="bg-zinc-950 border-zinc-800 text-sm rounded-xl h-11 focus-visible:ring-blue-500/50"
                  />
                  <Button
                    onClick={addActor}
                    variant="secondary"
                    className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl h-11 px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {actors.map((actor) => (
                    <span
                      key={actor}
                      className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-lg"
                    >
                      {actor}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-white"
                        onClick={() =>
                          setActors(actors.filter((a) => a !== actor))
                        }
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Seção Diretores */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Diretores favoritos [cite: 1307]
                </label>
                <div className="flex gap-2">
                  <Input
                    value={currentDirector}
                    onChange={(e) => setCurrentDirector(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addDirector()}
                    placeholder="Ex: Nolan, Tarantino..."
                    className="bg-zinc-950 border-zinc-800 text-sm rounded-xl h-11 focus-visible:ring-blue-500/50"
                  />
                  <Button
                    onClick={addDirector}
                    variant="secondary"
                    className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl h-11 px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {directors.map((dir) => (
                    <span
                      key={dir}
                      className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg"
                    >
                      {dir}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-white"
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
