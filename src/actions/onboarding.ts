"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Salva as preferências completas do Onboarding
export async function saveOnboardingData(data: {
  favorite_actors: string[];
  favorite_directors: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase
    .from("profiles")
    .update({
      favorite_actors: data.favorite_actors,
      favorite_directors: data.favorite_directors,
      onboarding_completed: true, // Marca como concluído
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

// Apenas marca como concluído se o usuário optar por pular
export async function skipOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: false }) // Mantém false, mas serve para sabermos que ele passou pela tela
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}
