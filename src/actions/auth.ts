"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// Função ajudante para a URL
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

// 1. Função de Login (Email e Senha) - É esta que estava faltando!
export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Falha no login: " + error.message);
  }

  redirect("/");
}

// 2. Função de Signup
export async function signup(_formData: FormData) {
  // Ajuste aqui se você estiver usando o signup com e-mail/senha
  return { error: "Conta criada! Verifique seu email." };
}

// 3. Login com Google
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

// 4. Logout
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
