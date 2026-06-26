import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, User, Sparkles, Film, Tv, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Captura a sessão do utilizador logado no servidor de forma segura
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Procura os dados do perfil para checar o status de calibração
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  // Se for uma conta nova com onboarding incompleto, joga para o wizard
  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 🌟 SUB-HEADER ULTRA PREMIUM: Organiza e-mail e botões em simetria absoluta */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900/20 border border-zinc-900/60 p-4 rounded-2xl backdrop-blur-xl shadow-md">
        {/* Lado Esquerdo: Identificação Corporativa do Utilizador */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-inner">
            <User className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Sessão Activa
            </span>
            <span className="text-sm font-bold text-zinc-200 tracking-wide">
              {user.email}
            </span>
          </div>
        </div>

        {/* Lado Direito: Ação de Controle da Biblioteca */}
        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider h-11 px-5 rounded-xl gap-2 transition-all duration-200 shadow-lg shadow-blue-950/30 w-full sm:w-auto">
            <Plus className="w-4 h-4 stroke-3" />
            <span>Adicionar Mídia</span>
          </Button>
        </div>
      </div>

      {/* ⚡ CARD DO MOTOR DE INTELIGÊNCIA ARTIFICIAL */}
      <div className="bg-linear-to-r from-zinc-900 via-zinc-900 to-amber-950/10 border border-zinc-800/80 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Motor de Recomendação Preditiva
          </h3>
          <p className="text-sm text-zinc-400 max-w-xl">
            O seu ecossistema está calibrado com as suas preferências. Gere
            sugestões personalizadas de mídias baseadas no seu perfil de IA.
          </p>
        </div>
        <Button className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider h-12 px-6 rounded-xl gap-2 shadow-lg shadow-amber-950/40 shrink-0 w-full md:w-auto relative z-10">
          <Sparkles className="w-4 h-4 fill-current" />
          Gerar Sugestões por IA
        </Button>
      </div>

      {/* 📋 CONTAINER DA ESTANTE VIRTUAL (ABAS/TABS) */}
      <div className="space-y-6 pt-2">
        <div className="border-b border-zinc-900 pb-3">
          <h2 className="text-xl font-black tracking-tight text-zinc-100">
            A Minha Estante Virtual
          </h2>
          <p className="text-xs text-zinc-500">
            Filtre e faça a gestão do progresso de suas maratonas
            cinematográficas.
          </p>
        </div>

        {/* Espaço reservado para as abas interativas que faremos a seguir */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-30 select-none pointer-events-none">
          <div className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-zinc-900 rounded-xl text-blue-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Quero Assistir</h4>
              <p className="text-xs text-zinc-500">Aguardando dados...</p>
            </div>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-zinc-900 rounded-xl text-purple-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Assistindo</h4>
              <p className="text-xs text-zinc-500">Aguardando dados...</p>
            </div>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-zinc-900 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Finalizados</h4>
              <p className="text-xs text-zinc-500">Aguardando dados...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
