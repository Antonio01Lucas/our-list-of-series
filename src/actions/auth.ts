"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// Definimos o formato do estado para não usar 'any'
export type ActionState = { error: string };

export async function login(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signup(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: formData.get("fullName") as string } },
  });

  if (error) {
    return { error: error.message };
  }

  return { error: "Conta criada! Verifique seu email." };
}

// Adicione a importação do redirect se não estiver lá no topo:
// import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/auth/callback", // Mais tarde criaremos essa rota para organizar o login!
    },
  });

  if (error) {
    console.error("Erro no login com Google:", error);
    return;
  }

  // O Supabase gera uma URL especial do Google. Nós redirecionamos o usuário para lá.
  if (data.url) {
    redirect(data.url);
  }
}
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
