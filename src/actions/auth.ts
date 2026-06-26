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

// Action: Fazer Login
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

// Action: Criar Conta Real (Corrigida e turbinada!)
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

  // Como retiramos a confirmação por e-mail no painel, o usuário já nasce ativo!
  // Devolvemos o sinal de sucesso exatamente no formato que o teu componente espera ler para exibir o texto verde.
  return { error: "Conta criada! Faça o seu login agora." };
}

// Action: Login com Google
export async function signInWithGoogle() {
  const supabase = await createClient();

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
