"use client";

import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  // 🌟 MÁGICA DO NEXT.JS: Se o usuário estiver na tela de login, o Header desaparece completamente!
  if (pathname === "/login") return null;

  return (
    <header className="w-full border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo clicável/visual do lado esquerdo */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Botão de Sair Premium com efeito hover destrutivo suave */}
        <Button
          onClick={async () => {
            console.log("🔌 [SyncWatch] Encerrando sessão ativa do usuário...");
            await signOut();
          }}
          variant="ghost"
          className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl gap-2 text-xs font-black uppercase tracking-widest transition-all duration-200 h-10 px-4"
        >
          <span>Sair</span>
          <LogOut className="w-4 h-4 stroke-[2.5]" />
        </Button>
        
      </div>
    </header>
  );
}