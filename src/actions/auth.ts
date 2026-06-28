"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// Tipo padrão para o estado de retorno dos formulários
type LoginState = {
  error: string;
};

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

// Action: Fazer Login (Mantém-se estável e funcional)
export async function login(prevState: LoginState, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Falha no login: " + error.message };
  }

  redirect("/");
}

// Action: Criar Conta Real (Modificada para Redirecionamento Direto! 🚀)
export async function signup(prevState: LoginState, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  console.log(
    `🚀 [SyncWatch Auth] Disparando criação de conta real na nuvem para: ${email}`,
  );

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error(
      "❌ Erro retornado pelo Supabase no cadastro:",
      error.message,
    );
    return { error: "Falha no cadastro: " + error.message };
  }

  console.log("✅ Usuário criado com sucesso no Auth! Dados:", data.user?.id);

  redirect("/onboarding");
  // 🔥 AJUSTE DE FLUXO: Envia o usuário imediatamente para o Onboarding após o cadastro
  // 🔥 MELHORIA CORE DE UX: O utilizador já nasce ativo e logado nos cookies!
  // Em vez de mandá-lo ler uma mensagem e digitar tudo de novo, jogamo-lo direto para a Home.
  // Lá, o gateway da Home vai perceber que o 'onboarding_completed' dele é falso e abrirá a calibração automaticamente.
}

// Action: Login com Google
export async function signInWithGoogle() {
  const supabase = await createClient();
  console.log(getBaseUrl());
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });

  if (error) {
    console.error("Erro no login com Google:", error);
    return;
  }

  if (data.url) {
    redirect(data.url);
  }
}

// Action: Terminar Sessão (Sair)
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
