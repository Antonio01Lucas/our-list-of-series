export const dynamic = "force-dynamic"; // 🔥 ISSO SEPARA O APP DOS PROBLEMAS DE CACHE! Força busca limpa no DB a cada f5.

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SeriesCard } from "@/components/SeriesCard";
import { Plus, User, Film, Sparkles } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Buscamos as séries cadastradas na estante do usuário
  const { data: series } = await supabase
    .from("series")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 2. Buscamos os dados de onboarding diretamente do perfil público do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  // 3. Aplicação das Regras de Negócio Preditivas
  const onboardingConcluido = profile?.onboarding_completed || false;
  const totalItensNaBiblioteca = series?.length || 0;
  const podeUsarIA = onboardingConcluido || totalItensNaBiblioteca >= 15;

  return (
    <div className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 text-white p-6 sm:p-12">
      {/* Container expandido para max-w-6xl */}
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-16 border-b border-zinc-900/60 pb-8">
          <Logo />
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/80 px-4 py-2 rounded-xl text-xs text-zinc-400 font-semibold tracking-wide">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              {user.email}
            </div>

            <Link href="/series/new">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl gap-2 px-5 py-6 shadow-xl shadow-blue-600/10 transition-all duration-200 tracking-wide text-sm">
                <Plus className="w-4 h-4 stroke-3" /> Adicionar Série
              </Button>
            </Link>
          </div>
        </header>

        {/* Seção Principal */}
        <main>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-50">
                Sua Biblioteca
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base font-medium mt-2">
                Monitore suas maratonas e gerencie seu progresso diário de
                episódios.
              </p>
            </div>

            {/* SEÇÃO DA INTELIGÊNCIA ARTIFICIAL: Botão Inteligente Condicional */}
            <div className="w-full md:w-auto shrink-0">
              {podeUsarIA ? (
                <Button className="w-full md:w-auto bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black px-6 py-6 rounded-2xl shadow-xl shadow-amber-500/5 flex items-center justify-center gap-2 text-sm tracking-wide transition-all duration-300">
                  <Sparkles className="w-4 h-4 fill-zinc-950" />
                  Gerar Lista Preditiva por IA
                </Button>
              ) : (
                <Link href="/onboarding" className="block w-full md:w-auto">
                  <Button
                    variant="outline"
                    className="w-full md:w-auto border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 font-bold px-6 py-6 rounded-2xl flex items-center justify-center gap-3 text-sm transition-all group"
                  >
                    <Sparkles className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                    <span>Liberar Lista Preditiva por IA</span>
                    <span className="text-[11px] bg-zinc-950/80 border border-zinc-800/80 px-2.5 py-1 rounded-lg text-blue-400 font-black tracking-wider">
                      {totalItensNaBiblioteca}/15 itens
                    </span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Grid de Séries reajustada com gap maior (gap-6) */}
          {series && series.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {series.map((serie) => (
                <SeriesCard key={serie.id} serie={serie} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl p-20 text-center max-w-lg mx-auto mt-16 bg-zinc-900/5 backdrop-blur-md">
              <Film className="w-12 h-12 text-zinc-700 mb-5" />
              <h3 className="font-extrabold text-xl text-zinc-200 tracking-tight">
                Nenhuma série cadastrada
              </h3>
              <p className="text-zinc-500 text-sm mt-2 mb-8 font-medium">
                Sua estante virtual está vazia. Comece populando sua lista para
                alimentar o algoritmo.
              </p>
              <Link href="/series/new">
                <Button
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900/20 hover:bg-zinc-800 text-zinc-300 rounded-xl font-bold px-6 py-5"
                >
                  Cadastrar meu primeiro título
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
