"use client";

import { useRouter } from "next/navigation";
import { skipOnboarding } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Clapperboard } from "lucide-react";
import { useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSkip() {
    setLoading(true);
    await skipOnboarding();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_45%)]" />

      <div className="max-w-xl w-full bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10 text-center space-y-8">
        <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-blue-400 shadow-inner">
          <Sparkles className="w-8 h-8 fill-blue-400/20 animate-pulse" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-zinc-50">
            Gostaria de calibrar sua{" "}
            <span className="text-blue-400">IA de Sugestões</span>?
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
            Ao responder 5 perguntas rápidas sobre seus diretores e atores
            favoritos, nosso algoritmo preditivo conseguirá sugerir títulos sob
            medida para você e seus amigos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Button
            onClick={() => router.push("/onboarding/questions")}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl py-6 tracking-wide flex items-center justify-center gap-2 text-sm order-2 sm:order-1"
          >
            Responder Perguntas
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleSkip}
            disabled={loading}
            variant="outline"
            className="border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-bold rounded-2xl py-6 text-sm order-1 sm:order-2"
          >
            Configurar depois
          </Button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 font-bold uppercase tracking-wider pt-2">
          <Clapperboard className="w-3.5 h-3.5" />
          <span>
            Você também pode liberar a IA adicionando 15 itens à sua estante
          </span>
        </div>
      </div>
    </div>
  );
}
