"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateSeriesStatus(id: string, newStatus: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("series")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar:", error);
    throw new Error("Falha ao atualizar o status.");
  }

  revalidatePath("/"); // Isso avisa ao Next.js que os dados mudaram
  return { success: true };
}

type ActionState = {
  error: string;
};
export async function addSeries(_prevState: ActionState, formData: FormData) {
  const supabase = await createClient();

  // 1. Verifica quem está logado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Usuário não autenticado" };
  }

  // ... resto do seu código permanece igual

  // 2. Pega os dados do form
  const title = formData.get("title") as string;
  const status = formData.get("status") as string;

  // 3. Salva no banco
  const { error } = await supabase.from("series").insert({
    user_id: user.id,
    title,
    status,
  });

  if (error) {
    return { error: error.message };
  }

  // 4. Se deu certo, atualiza a home e redireciona
  revalidatePath("/");
  redirect("/");
}

// src/actions/series.ts
export async function updateSeriesRating(id: string, rating: number) {
  const supabase = await createClient();

  // Validação simples para garantir que a nota é de 1 a 10
  if (rating < 1 || rating > 10) return { error: "Nota deve ser entre 1 e 10" };

  const { error } = await supabase
    .from("series")
    .update({ rating })
    .eq("id", id);

  if (error) throw new Error("Erro ao salvar nota");

  revalidatePath("/");
  return { success: true };
}
