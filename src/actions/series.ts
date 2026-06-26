"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. Ação para Adicionar Série (Aceitando apenas o formData nativo do Next.js)
export async function addSeries(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const status = formData.get("status") as string;

  const { error } = await supabase.from("series").insert({
    user_id: user.id,
    title,
    status,
  });

  if (error) {
    console.error("Erro ao inserir série:", error);
    return;
  }

  revalidatePath("/");
  redirect("/");
}

// 2. Ação para atualizar status rápido (Assistindo -> Finalizado)
export async function updateSeriesStatus(id: string, newStatus: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("series")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar status:", error);
    throw new Error("Falha ao atualizar o status.");
  }

  revalidatePath("/");
  return { success: true };
}

// 3. Ação para atualizar Nota de 1 a 10
export async function updateSeriesRating(id: string, rating: number) {
  const supabase = await createClient();

  if (rating < 1 || rating > 10) return { error: "Nota deve ser entre 1 e 10" };

  const { error } = await supabase
    .from("series")
    .update({ rating })
    .eq("id", id);

  if (error) throw new Error("Erro ao salvar nota");

  revalidatePath("/");
  return { success: true };
}

// 4. Ação para atualizar progresso de temporadas e episódios
export async function updateSeriesProgress(
  id: number,
  data: {
    current_season?: number;
    current_episode?: number;
    status?: string;
  },
) {
  const supabase = await createClient();

  const { error } = await supabase.from("series").update(data).eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  return { success: true };
}
