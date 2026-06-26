"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Action: Deletar Filme ou Série (CRUD completo com tipagem de ID flexível)
export async function deleteSeries(id: string | number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // LOGS DE DEPURAÇÃO: Verifique o terminal do VS Code ao clicar na lixeira
  console.log(
    `🔥 [SyncWatch DB] Tentando deletar item ID: ${id} (Tipo: ${typeof id}) para o usuário: ${user.id}`,
  );

  const { error, count } = await supabase
    .from("series")
    .delete({ count: "exact" }) // Força o banco a nos responder quantas linhas foram apagadas
    .eq("id", id)
    .eq("user_id", user.id);

  console.log(
    `📊 [SyncWatch DB] Resultado da exclusão -> Linhas afetadas: ${count}, Erro:`,
    error,
  );

  if (error) {
    console.error("Erro ao deletar item:", error);
    throw new Error("Falha ao deletar o item.");
  }

  revalidatePath("/");
}

// Action: Atualizar Progresso com suporte a ID flexível (string ou number)
export async function updateSeriesProgress(
  id: string | number,
  data: { current_season?: number; current_episode?: number; status?: string },
) {
  const supabase = await createClient();
  const { error } = await supabase.from("series").update(data).eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}

// Action: Atualizar Nota Avaliativa (1 a 10)
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

// Action: Adicionar Novo Título enriquecendo metadados automaticamente pela API
export async function addSeries(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const status = formData.get("status") as string;
  const media_type = (formData.get("media_type") as string) || "tv";
  const rawTmdbId = formData.get("tmdb_id");
  const tmdb_id = rawTmdbId && rawTmdbId !== "" ? Number(rawTmdbId) : null;

  let poster_path = (formData.get("poster_path") as string) || null;
  let genres: string[] = [];
  let is_in_production = true;
  let total_seasons = 1;
  let total_episodes = 1;
  let runtime = 0;

  if (tmdb_id) {
    const apiKey = process.env.TMDB_API_KEY;
    if (apiKey) {
      try {
        const isTokenV4 = apiKey.startsWith("eyJ");
        const url = isTokenV4
          ? `https://api.themoviedb.org/3/${media_type}/${tmdb_id}?language=pt-BR`
          : `https://api.themoviedb.org/3/${media_type}/${tmdb_id}?api_key=${apiKey}&language=pt-BR`;

        const headers: Record<string, string> = {};
        if (isTokenV4) headers["Authorization"] = `Bearer ${apiKey}`;

        const response = await fetch(url, { headers });
        if (response.ok) {
          const details = await response.json();

          genres = details.genres?.map((g: { name: string }) => g.name) || [];
          poster_path = details.poster_path || poster_path;

          if (media_type === "tv") {
            is_in_production = details.in_production ?? true;
            total_seasons = details.number_of_seasons || 1;
            total_episodes = details.number_of_episodes || 1;
            runtime = details.episode_run_time?.[0] || 45;
          } else {
            is_in_production = false;
            total_seasons = 0;
            total_episodes = 0;
            runtime = details.runtime || 0;
          }
        }
      } catch (err) {
        console.error("Falha ao enriquecer dados com a API do TMDB:", err);
      }
    }
  }

  const { error } = await supabase.from("series").insert({
    user_id: user.id,
    title,
    status,
    tmdb_id,
    media_type,
    poster_path,
    genres,
    is_in_production,
    total_seasons,
    total_episodes,
    runtime,
    current_season: media_type === "movie" ? 0 : 1,
    current_episode: media_type === "movie" ? 0 : 1,
  });

  if (error) {
    console.error("Erro ao inserir no banco:", error);
    return;
  }

  revalidatePath("/");
  redirect("/");
}
