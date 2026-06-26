"use client";

import { useState, useActionState } from "react";
import { login, signup, signInWithGoogle } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { Lock, Mail, AlertCircle } from "lucide-react";

// Estado inicial para o form action
const initialState = { error: "" };

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Next.js useActionState para gerenciar o estado da Server Action de forma nativa
  const [loginState, loginAction, isLoginPending] = useActionState(
    login,
    initialState,
  );
  const [signupState, signupAction, isSignupPending] = useActionState(
    signup,
    initialState,
  );

  const activeState = isSignUp ? signupState : loginState;
  const isPending = isLoginPending || isSignupPending;

  // Lógica de Validação Estrita do Botão
  const isEmailValid = email.includes("@") && email.includes(".");
  const isPasswordValid = password.length >= 6;

  // O botão só libera se o e-mail for minimamente válido e a senha tiver 6 ou mais dígitos
  const isButtonDisabled = !isEmailValid || !isPasswordValid || isPending;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Efeito de Iluminação de Fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.06),transparent_50%)] pointer-events-none" />

      <div className="max-w-md w-full bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Logo & Subtítulo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo />
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest pt-2">
            {isSignUp
              ? "Crie sua conta no ecossistema"
              : "Monitore suas maratonas de cinema"}
          </p>
        </div>

        {/* Formulário de Ação */}
        <form
          action={isSignUp ? signupAction : loginAction}
          className="space-y-4"
        >
          {/* Campo E-mail */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-zinc-500" /> E-mail
            </label>
            <Input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@exemplo.com"
              className="bg-zinc-950 border-zinc-800 rounded-xl h-12 focus-visible:ring-blue-500/50 text-sm"
            />
          </div>

          {/* Campo Senha */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-zinc-500" /> Senha
            </label>
            <Input
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-950 border-zinc-800 rounded-xl h-12 focus-visible:ring-blue-500/50 text-sm"
            />

            {/* Indicador de Requisito de Senha (Dígitos) */}
            <div className="flex items-center gap-1.5 pt-1">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-colors ${isPasswordValid ? "bg-emerald-500" : "bg-zinc-700"}`}
              />
              <span
                className={`text-[11px] font-bold tracking-wide transition-colors ${isPasswordValid ? "text-emerald-400/90" : "text-zinc-500"}`}
              >
                Mínimo de 6 caracteres
              </span>
            </div>
          </div>

          {/* Alert de Erro caso o Supabase recuse algo */}
          {activeState?.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 flex items-start gap-2.5 text-xs font-semibold animate-in shake duration-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{activeState.error}</span>
            </div>
          )}

          {/* Botão de Submissão Inteligente Controlado por Estado */}
          <Button
            type="submit"
            disabled={isButtonDisabled}
            className={`w-full h-12 font-extrabold rounded-xl text-sm uppercase tracking-wider shadow-lg transition-all duration-300 mt-2 ${
              isSignUp
                ? "bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
                : "bg-zinc-100 hover:bg-white text-zinc-950"
            } disabled:opacity-40 disabled:pointer-events-none`}
          >
            {isPending
              ? "Processando..."
              : isSignUp
                ? "Criar Minha Conta"
                : "Entrar no App"}
          </Button>
        </form>

        {/* Divisor Visual */}
        <div className="relative flex py-2 items-center text-xs font-bold uppercase tracking-widest text-zinc-600">
          <div className="grow border-t border-zinc-900" />
          <span className="shrink mx-4">Ou conectar com</span>
          <div className="grow border-t border-zinc-900" />
        </div>

        {/* Provedor OAuth: Google */}
        <Button
          onClick={() => signInWithGoogle()}
          variant="outline"
          className="w-full h-12 border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google Cloud Account
        </Button>

        {/* Alternador de Estado (Login <-> Cadastro) */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              // Limpa a senha ao alternar para evitar travas visuais
              setPassword("");
            }}
            className="text-xs font-bold text-zinc-500 hover:text-blue-400 transition-colors tracking-wide"
          >
            {isSignUp
              ? "Já possui uma credencial? Faça o login"
              : "Não tem uma conta? Cadastre-se na plataforma"}
          </button>
        </div>
      </div>
    </div>
  );
}
