"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Action: Deletar Filme ou Série (CRUD totalmente blindado)
export async function deleteSeries(id: string | number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Garante a conversão correta para o tipo numérico do BIGSERIAL do Postgres
  const targetId =
    typeof id === "string" && !isNaN(Number(id)) ? Number(id) : id;

  console.log(`🔥 [SyncWatch DB] Disparando DELETE para o ID: ${targetId}`);

  const { error, count } = await supabase
    .from("series")
    .delete({ count: "exact" }) // Exige a contagem exata
    .eq("id", targetId); // Deixamos apenas o ID aqui! O RLS se encarrega do user_id.

  console.log(`📊 [SyncWatch DB] Linhas afetadas: ${count}, Erro:`, error);

  if (error) {
    throw new Error(error.message);
  }

  // Se mesmo sem o filtro o banco retornar 0, a sua política RLS no painel do Supabase precisa de um ajuste
  if (count === 0) {
    throw new Error(
      "O RLS do Supabase bloqueou a exclusão. Verifique as permissões de DELETE no painel.",
    );
  }

  revalidatePath("/", "layout");
}

// Action: Atualizar Progresso
export async function updateSeriesProgress(
  id: string | number,
  data: { current_season?: number; current_episode?: number; status?: string },
) {
  const supabase = await createClient();
  const targetId =
    typeof id === "string" && !isNaN(Number(id)) ? Number(id) : id;

  const { error } = await supabase
    .from("series")
    .update(data)
    .eq("id", targetId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

// Action: Atualizar Nota Avaliativa
export async function updateSeriesRating(id: string | number, rating: number) {
  const supabase = await createClient();
  if (rating < 1 || rating > 10) return { error: "Nota deve ser entre 1 e 10" };

  const targetId =
    typeof id === "string" && !isNaN(Number(id)) ? Number(id) : id;

  const { error } = await supabase
    .from("series")
    .update({ rating })
    .eq("id", targetId);
  if (error) throw new Error("Erro ao salvar nota");

  revalidatePath("/", "layout");
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

  revalidatePath("/", "layout");
  redirect("/");
}
