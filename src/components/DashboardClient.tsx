"use client";

import { useState } from "react";
import Image from "next/image";
// 🌟 IMPORTANTE: Adicionámos o deleteMedia aqui
import {
  addOrUpdateMedia,
  getAiRecommendations,
  deleteMedia,
} from "@/actions/media";
import { MediaSearch } from "@/components/MediaSearch";
import { Button } from "@/components/ui/button";
import {
  Plus,
  User,
  Sparkles,
  Film,
  Tv,
  CheckCircle2,
  X,
  Loader2,
  Play,
  Calendar,
  Star,
  ChevronRight,
  Pencil,
  Trash2, // 🌟 Ícone da lixeira adicionado
} from "lucide-react";

interface MediaPayload {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  media_type: "movie" | "tv";
  status: "assistir" | "assistindo" | "finalizados";
  rating: number | null;
  current_season: number;
  current_episode: number;
}

interface UserMedia {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  media_type: string;
  status: string;
  rating: number | null;
  current_season: number;
  current_episode: number;
}

interface AiRecommendation {
  id: string;
  title: string;
  reason: string;
  media_type: "movie" | "tv";
  poster_path: string | null;
}

interface SearchResultItem {
  id: number | string;
  title?: string;
  name?: string;
  poster_path: string | null;
}

interface Props {
  userEmail: string;
  initialMedia: UserMedia[];
}

export function DashboardClient({ userEmail, initialMedia }: Props) {
  const [activeTab, setActiveTab] = useState<
    "assistir" | "assistindo" | "finalizados"
  >("assistir");
  const [library, setLibrary] = useState<UserMedia[]>(initialMedia);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchType, setSearchType] = useState<"movie" | "tv">("movie");
  const [selectedSearchItem, setSelectedSearchItem] =
    useState<SearchResultItem | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserMedia | null>(null);

  const [mediaStatus, setMediaStatus] = useState<
    "assistir" | "assistindo" | "finalizados"
  >("assistir");
  const [mediaRating, setMediaRating] = useState<number>(5);
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // 🌟 Estado para controlar o loading do delete

  const [aiLoading, setAiLoading] = useState(false);
  const [aiStep, setAiStep] = useState("");
  const [aiResults, setAiResults] = useState<AiRecommendation[]>([]);

  const filteredLibrary = library.filter((item) => {
    const currentStatus = item.status?.toLowerCase();
    if (activeTab === "assistir")
      return currentStatus === "assistir" || currentStatus === "planning";
    if (activeTab === "assistindo")
      return currentStatus === "assistindo" || currentStatus === "watching";
    if (activeTab === "finalizados")
      return (
        currentStatus === "finalizados" ||
        currentStatus === "completed" ||
        currentStatus === "finalizado"
      );
    return false;
  });

  const handleTriggerAi = async () => {
    try {
      setAiResults([]);
      setAiLoading(true);
      setAiStep("Analisando os teus diretores e atores favoritos...");
      await new Promise((r) => setTimeout(r, 800));
      setAiStep("Cruzando géneros cinematográficos com a tua biblioteca...");
      await new Promise((r) => setTimeout(r, 900));
      setAiStep("A gerar recomendações customizadas...");
      const recommendations = await getAiRecommendations();
      setAiResults(recommendations);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
      setAiStep("");
    }
  };

  const handleSaveMedia = async () => {
    if (!selectedSearchItem) return;
    try {
      setIsSaving(true);
      const resolvedTitle =
        selectedSearchItem.title ||
        selectedSearchItem.name ||
        "Título Desconhecido";

      const payload: MediaPayload = {
        tmdb_id: Number(selectedSearchItem.id),
        title: resolvedTitle,
        poster_path: selectedSearchItem.poster_path || null,
        media_type: searchType === "tv" ? "tv" : "movie",
        status: mediaStatus,
        rating: mediaStatus === "finalizados" ? mediaRating : null,
        current_season:
          searchType === "tv" && mediaStatus === "assistindo" ? season : 1,
        current_episode:
          searchType === "tv" && mediaStatus === "assistindo" ? episode : 1,
      };

      await addOrUpdateMedia(payload);

      const updatedItem: UserMedia = {
        id: Math.random().toString(),
        ...payload,
      };

      setLibrary((prev) => {
        const filtered = prev.filter(
          (item) => item.tmdb_id !== payload.tmdb_id,
        );
        return [...filtered, updatedItem];
      });

      setActiveTab(mediaStatus);
      setIsAddModalOpen(false);
      setSelectedSearchItem(null);
    } catch (err) {
      console.error("Erro completo ao tentar salvar mídia:", err);
      alert("Falha ao salvar o título. Verifica as configurações do banco.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (item: UserMedia) => {
    setEditingItem(item);
    // Cast corrigido para não usar "any"
    setMediaStatus(
      (item.status as "assistir" | "assistindo" | "finalizados") || "assistir",
    );
    setMediaRating(item.rating || 5);
    setSeason(item.current_season || 1);
    setEpisode(item.current_episode || 1);
    setIsEditModalOpen(true);
  };

  const handleUpdateMedia = async () => {
    if (!editingItem) return;
    try {
      setIsSaving(true);
      const isTv =
        editingItem.media_type.toLowerCase() === "tv" ||
        editingItem.media_type.toLowerCase() === "series";

      const payload: MediaPayload = {
        tmdb_id: editingItem.tmdb_id,
        title: editingItem.title,
        poster_path: editingItem.poster_path,
        media_type: isTv ? "tv" : "movie",
        status: mediaStatus,
        rating: mediaStatus === "finalizados" ? mediaRating : null,
        current_season: isTv && mediaStatus === "assistindo" ? season : 1,
        current_episode: isTv && mediaStatus === "assistindo" ? episode : 1,
      };

      await addOrUpdateMedia(payload);

      setLibrary((prev) =>
        prev.map((item) =>
          item.tmdb_id === payload.tmdb_id ? { ...item, ...payload } : item,
        ),
      );

      setActiveTab(mediaStatus);
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      alert("Falha ao atualizar o título.");
    } finally {
      setIsSaving(false);
    }
  };

  // 🌟 NOVA FUNÇÃO: Deletar item
  const handleDeleteMedia = async () => {
    if (!editingItem) return;

    // Confirmação simples para evitar exclusão acidental
    const confirmDelete = window.confirm(
      `Tens a certeza que desejas remover "${editingItem.title}" da tua estante?`,
    );
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);

      // Chama o backend para deletar
      await deleteMedia(editingItem.tmdb_id);

      // Remove do estado local (faz a capa sumir da tela imediatamente)
      setLibrary((prev) =>
        prev.filter((item) => item.tmdb_id !== editingItem.tmdb_id),
      );

      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Erro ao deletar mídia:", err);
      alert("Falha ao remover o título. Verifica a tua conexão.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      {/* BARRA SUPERIOR DO USUÁRIO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900/20 border border-zinc-900/60 p-4 rounded-2xl backdrop-blur-xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <User className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Sessão Ativa
            </span>
            <span className="text-sm font-bold text-zinc-200 tracking-wide">
              {userEmail}
            </span>
          </div>
        </div>

        <div>
          <Button
            onClick={() => {
              setSearchType("movie");
              setSelectedSearchItem(null);
              setMediaStatus("assistir");
              setMediaRating(5);
              setIsAddModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider h-11 px-5 rounded-xl gap-2 transition-all duration-200 shadow-lg shadow-blue-950/30 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 stroke-3" />
            <span>Adicionar Mídia</span>
          </Button>
        </div>
      </div>

      {/* BLOCO DO MOTOR DE INTELIGÊNCIA ARTIFICIAL */}
      <div className="bg-linear-to-r from-zinc-900 via-zinc-900 to-amber-950/10 border border-zinc-800/80 p-6 rounded-3xl flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
          <div className="space-y-1 relative z-10">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Motor de Recomendação Preditiva
            </h3>
            <p className="text-sm text-zinc-400 max-w-xl">
              O teu ecossistema está calibrado. Gera sugestões personalizadas
              baseadas no teu perfil de IA.
            </p>
          </div>

          <Button
            onClick={handleTriggerAi}
            disabled={aiLoading}
            className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider h-12 px-6 rounded-xl gap-2 shadow-lg shadow-amber-950/40 shrink-0 w-full md:w-auto relative z-10 disabled:opacity-50"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Gerar Sugestões por IA</span>
              </>
            )}
          </Button>
        </div>

        {aiLoading && (
          <div className="p-4 bg-zinc-950/40 border border-zinc-800/60 rounded-2xl flex items-center gap-3 text-xs font-bold text-amber-400/90 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{aiStep}</span>
          </div>
        )}

        {aiResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 animate-in fade-in zoom-in-95 duration-300">
            {aiResults.map((rec) => (
              <div
                key={rec.id}
                className="bg-zinc-950/80 border border-amber-500/20 rounded-2xl p-4 flex gap-4 hover:border-amber-500/40 transition"
              >
                <div className="w-16 h-24 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center">
                  {rec.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${rec.poster_path}`}
                      alt={rec.title}
                      width={64}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] font-bold text-zinc-600 text-center px-1">
                      Sem Imagem
                    </span>
                  )}
                </div>
                <div className="space-y-1 flex flex-col justify-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-full w-fit">
                    {rec.media_type === "movie" ? "Filme" : "Série"}
                  </span>
                  <h4 className="font-bold text-sm text-zinc-200 line-clamp-1">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed">
                    {rec.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPONENTE DE ABAS DA ESTANTE */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-900 pb-4 gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight text-zinc-100">
              A Minha Estante Virtual
            </h2>
            <p className="text-xs text-zinc-500">
              Gere e filtra o progresso das tuas maratonas cinematográficas.
            </p>
          </div>

          <div className="flex p-1 bg-zinc-900/60 border border-zinc-800 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("assistir")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition ${activeTab === "assistir" ? "bg-zinc-800 text-blue-400 shadow" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <Calendar className="w-3.5 h-3.5" /> Assistir
            </button>
            <button
              onClick={() => setActiveTab("assistindo")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition ${activeTab === "assistindo" ? "bg-zinc-800 text-purple-400 shadow" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <Play className="w-3.5 h-3.5" /> Assistindo
            </button>
            <button
              onClick={() => setActiveTab("finalizados")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition ${activeTab === "finalizados" ? "bg-zinc-800 text-emerald-400 shadow" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Finalizados
            </button>
          </div>
        </div>

        {filteredLibrary.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-900 rounded-2xl text-zinc-600 font-medium text-sm">
            Nenhum título adicionado nesta categoria ainda.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {filteredLibrary.map((item) => {
              const isTvType =
                item.media_type?.toLowerCase() === "tv" ||
                item.media_type?.toLowerCase() === "series";
              const isWatchingStatus =
                item.status?.toLowerCase() === "assistindo" ||
                item.status?.toLowerCase() === "watching";

              return (
                <div
                  key={item.id}
                  className="group aspect-2/3 bg-zinc-900/40 border border-zinc-800 rounded-2xl relative overflow-hidden shadow transition hover:border-zinc-700"
                >
                  {item.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                      alt={item.title}
                      width={220}
                      height={330}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs font-bold text-zinc-500">
                      {item.title}
                    </div>
                  )}

                  {/* OVERLAY DO CARTÃO COM BOTÃO DE EDIÇÃO */}
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-200 p-3 flex flex-col justify-end gap-1.5">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="absolute top-3 right-3 bg-zinc-950/80 border border-zinc-700 p-2 rounded-full text-zinc-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-lg backdrop-blur-md translate-y-2.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <h5 className="font-bold text-xs text-zinc-200 line-clamp-1">
                      {item.title}
                    </h5>

                    {item.rating && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= (item.rating || 0)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-zinc-800/80 text-zinc-800/80"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {isTvType && isWatchingStatus && (
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-md w-fit">
                        T{item.current_season} • E{item.current_episode}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE ADIÇÃO DE MÍDIA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-black text-base text-zinc-100 uppercase tracking-wide">
                Adicionar Novo Título
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedSearchItem(null);
                }}
                className="text-zinc-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-850 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setSearchType("movie");
                  setSelectedSearchItem(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${searchType === "movie" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
              >
                <Film className="w-3.5 h-3.5" /> Filtrar por Filmes
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchType("tv");
                  setSelectedSearchItem(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${searchType === "tv" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
              >
                <Tv className="w-3.5 h-3.5" /> Filtrar por Séries
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Buscar no Catálogo Global
              </label>
              <MediaSearch
                type={searchType}
                placeholder={
                  searchType === "movie"
                    ? "Digite o nome do filme..."
                    : "Digite o nome da série..."
                }
                onSelect={(media) => setSelectedSearchItem(media)}
              />
            </div>

            {selectedSearchItem && (
              <div className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-xl space-y-4 animate-in zoom-in-95 duration-200">
                <div className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  Selecionado:{" "}
                  <span className="text-white font-black">
                    {selectedSearchItem.title || selectedSearchItem.name}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Mover para qual Categoria?
                  </label>
                  <select
                    value={mediaStatus}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setMediaStatus(
                        e.target.value as
                          | "assistir"
                          | "assistindo"
                          | "finalizados",
                      )
                    }
                    className="w-full h-11 bg-zinc-900 border border-zinc-800 text-sm rounded-xl px-3 font-medium text-zinc-200 focus:outline-none focus:border-zinc-700"
                  >
                    <option value="assistir">
                      Quero Assistir (Planejamento)
                    </option>
                    <option value="assistindo">
                      Assistindo Agora (Maratona Ativa)
                    </option>
                    <option value="finalizados">
                      Finalizado (Histórico Concluído)
                    </option>
                  </select>
                </div>

                {searchType === "tv" && mediaStatus === "assistindo" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                        Temporada Atual
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={season}
                        onChange={(e) => setSeason(Number(e.target.value))}
                        className="w-full h-11 bg-zinc-900 border border-zinc-800 text-center text-sm font-bold text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                        Episódio Atual
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={episode}
                        onChange={(e) => setEpisode(Number(e.target.value))}
                        className="w-full h-11 bg-zinc-900 border border-zinc-800 text-center text-sm font-bold text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {mediaStatus === "finalizados" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      A Tua Avaliação
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setMediaRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors duration-200 ${
                              star <= mediaRating
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                : "fill-zinc-800 text-zinc-700"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-amber-400">
                        {mediaRating} / 5
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedSearchItem(null);
                }}
                className="border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white rounded-xl text-xs uppercase font-bold tracking-wider h-11 px-4"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveMedia}
                disabled={!selectedSearchItem || isSaving}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-wider h-11 px-5 disabled:opacity-40"
              >
                {isSaving ? "Salvando..." : "Salvar na Estante"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 MODAL DE EDIÇÃO ATUALIZADO (Poster maior e botão Lixeira) */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-black text-base text-zinc-100 uppercase tracking-wide">
                Editar Progresso
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-zinc-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 🌟 POSTER AUMENTADO AQUI */}
            <div className="flex items-center gap-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-850">
              {editingItem.poster_path ? (
                <div className="w-20 h-28 bg-zinc-800 rounded-lg overflow-hidden shrink-0 shadow-md">
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${editingItem.poster_path}`}
                    alt={editingItem.title}
                    width={80}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-28 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0 shadow-md">
                  <Film className="w-6 h-6 text-zinc-600" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold text-base text-zinc-100 leading-tight mb-1">
                  {editingItem.title}
                </h4>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">
                  {editingItem.media_type === "movie" ? "Filme" : "Série"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Categoria
                </label>
                <select
                  value={mediaStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setMediaStatus(
                      e.target.value as
                        | "assistir"
                        | "assistindo"
                        | "finalizados",
                    )
                  }
                  className="w-full h-11 bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-3 font-medium text-zinc-200 focus:outline-none focus:border-zinc-700"
                >
                  <option value="assistir">
                    Quero Assistir (Planejamento)
                  </option>
                  <option value="assistindo">
                    Assistindo Agora (Maratona Ativa)
                  </option>
                  <option value="finalizados">
                    Finalizado (Histórico Concluído)
                  </option>
                </select>
              </div>

              {(editingItem.media_type.toLowerCase() === "tv" ||
                editingItem.media_type.toLowerCase() === "series") &&
                mediaStatus === "assistindo" && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                        Temporada
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={season}
                        onChange={(e) => setSeason(Number(e.target.value))}
                        className="w-full h-11 bg-zinc-950 border border-zinc-800 text-center text-sm font-bold text-white focus:outline-none rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                        Episódio
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={episode}
                        onChange={(e) => setEpisode(Number(e.target.value))}
                        className="w-full h-11 bg-zinc-950 border border-zinc-800 text-center text-sm font-bold text-white focus:outline-none rounded-xl"
                      />
                    </div>
                  </div>
                )}

              {mediaStatus === "finalizados" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    A Tua Avaliação
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setMediaRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors duration-200 ${
                            star <= mediaRating
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                              : "fill-zinc-800 text-zinc-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 🌟 FOOTER ATUALIZADO COM O BOTÃO DE EXCLUIR */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-800 mt-2">
              <button
                type="button"
                onClick={handleDeleteMedia}
                disabled={isDeleting || isSaving}
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                title="Remover da Estante"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white rounded-xl text-xs uppercase font-bold tracking-wider h-11 px-4"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdateMedia}
                  disabled={isSaving || isDeleting}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-wider h-11 px-5 disabled:opacity-40"
                >
                  {isSaving ? "A Salvar..." : "Atualizar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
