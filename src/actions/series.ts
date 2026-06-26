"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. Ação para Adicionar Série (Aceitando apenas o formData nativo do Next.js)
// Substitua APENAS a função addSeries dentro de src/actions/series.ts

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
  const media_type = (formData.get("media_type") as string) || "tv"; // Captura se é filme ou série
  const rawTmdbId = formData.get("tmdb_id");
  const tmdb_id = rawTmdbId && rawTmdbId !== "" ? Number(rawTmdbId) : null;

  // Valores padrão de segurança
  let poster_path = (formData.get("poster_path") as string) || null;
  let genres: string[] = [];
  let is_in_production = true;
  let total_seasons = 1;
  let total_episodes = 1;

  // Se tiver um ID do TMDB, buscamos os detalhes completos diretamente pelo Servidor
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

          // Mapeia os gêneros extraídos da API
          genres = details.genres?.map((g: { name: string }) => g.name) || [];
          poster_path = details.poster_path || poster_path;

          if (media_type === "tv") {
            is_in_production = details.in_production ?? true;
            total_seasons = details.number_of_seasons || 1;
            total_episodes = details.number_of_episodes || 1;
          } else {
            // Se for filme, não tem temporadas
            is_in_production = false;
            total_seasons = 0;
            total_episodes = 0;
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
