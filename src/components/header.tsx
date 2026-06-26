"use client";

import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  // O cabeçalho fica completamente invisível na tela de login
  if (pathname === "/login") return null;

  // Esconde o logo apenas se estiver no fluxo de onboarding para evitar duplicações visuais
  const isOnboarding = pathname?.startsWith("/onboarding");

  return (
    <header className="w-full bg-zinc-950 border-b border-zinc-900/80 h-16 shrink-0 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Lado Esquerdo: Adicionado 'translate-y-1' para descer/baixar o logótipo um pouco mais */}
        <div className="flex items-center h-full pt-3 pb-1 transform translate-y-5 scale-80 origin-left">
          {!isOnboarding && <Logo />}
        </div>

        {/* Lado Direito: Terminar Sessão encapsulado num Form nativo de Server Actions */}
        <form action={signOut} className="flex items-center">
          <Button
            type="submit"
            variant="ghost"
            className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl gap-2 text-xs font-black uppercase tracking-widest transition-all h-10 px-4 flex items-center justify-center"
          >
            <span>Sair</span>
            <LogOut className="w-4 h-4 stroke-[2.5]" />
          </Button>
        </form>
      </div>
    </header>
  );
}
