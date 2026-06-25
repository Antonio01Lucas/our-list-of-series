"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// Criamos um tipo para o estado do seu formulário
type LoginState = {
  error: string;
};

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

// 1. Aplicamos o tipo LoginState aqui
export async function login(prevState: LoginState, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Agora o retorno está alinhado com o tipo LoginState
    return { error: "Falha no login: " + error.message };
  }

  redirect("/");
}

export async function signup() {
  return { error: "Conta criada! Verifique seu email." };
}

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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
