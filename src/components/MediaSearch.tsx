"use client";

// ======================================================
// IMPORTAÇÕES
// ======================================================
//
// Este componente utiliza React Query para realizar buscas
// assíncronas na API do TMDB e componentes do Shadcn/UI
// para fornecer uma experiência de pesquisa moderna.
//

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ======================================================
// INTERFACES
// ======================================================
//
// TMDBMediaItem:
// Representa o formato simplificado de um resultado
// retornado pela API do TMDB.
//
// MediaSearchProps:
// Define as propriedades aceitas pelo componente,
// permitindo reutilização em diferentes páginas.
//

interface TMDBMediaItem {
  id: number;
  name?: string;
  title?: string;
  first_air_date?: string;
  release_date?: string;
  poster_path: string | null;
  profile_path?: string | null;
}

interface MediaSearchProps {
  type: "tv" | "movie" | "person";
  placeholder?: string;
  className?: string;
  popoverClassName?: string;
  onSelect: (media: {
    id: number;
    title: string;
    poster_path: string | null;
  }) => void;
}

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================
//
// MediaSearch
//
// Campo de pesquisa reutilizável para consultar o catálogo
// do TMDB.
//
// Características:
// • Busca filmes, séries ou pessoas.
// • Utiliza debounce para reduzir chamadas à API.
// • Exibe resultados em um Popover.
// • Retorna o item selecionado ao componente pai.
//

export function MediaSearch({
  type,
  placeholder = "Pesquisar...",
  onSelect,
  className,
  popoverClassName,
}: MediaSearchProps) {
  // ======================================================
  // ESTADOS DO COMPONENTE
  // ======================================================

  // Controla se o Popover está aberto.
  const [open, setOpen] = React.useState(false);

  // Texto exibido no campo de pesquisa.
  const [value, setValue] = React.useState("");

  // Valor utilizado para efetuar a consulta na API.
  // É atualizado somente após o debounce.
  const [search, setSearch] = React.useState("");

  // ======================================================
  // DEBOUNCE DA PESQUISA
  // ======================================================
  //
  // Aguarda 400 ms após o usuário parar de digitar antes
  // de atualizar o estado responsável pela consulta.
  //
  // Isso evita múltiplas requisições consecutivas ao TMDB.
  //

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(value);
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  // ======================================================
  // CONSULTA AO TMDB
  // ======================================================
  //
  // Realiza a busca utilizando React Query.
  //
  // A consulta somente é executada quando existe texto
  // digitado pelo usuário.
  //
  // Os resultados ficam armazenados em cache conforme
  // o tipo da mídia e o termo pesquisado.
  //

  const { data, isLoading } = useQuery<TMDBMediaItem[]>({
    queryKey: ["mediaSearch", type, search],
    queryFn: async () => {
      if (!search) return [];
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(search)}&type=${type}`,
      );
      if (!response.ok) throw new Error("Erro ao buscar dados do catálogo");
      const resData = await response.json();
      return resData.results || [];
    },
    enabled: search.length > 0,
  });

  // ======================================================
  // RENDERIZAÇÃO
  // ======================================================
  //
  // Estrutura:
  //
  // • Popover
  //     ├── Botão de pesquisa
  //     └── Lista de resultados
  //
  // O componente é totalmente reutilizável e permite
  // personalização através das propriedades recebidas.
  //

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* =====================================================
    BOTÃO QUE ABRE O POPOVER
    =====================================================

    Exibe o texto digitado ou o placeholder informado
    pelo componente pai.
  */}

        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-15 justify-between bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900 rounded-2xl px-3 text-sm sm:text-base font-medium transition-all duration-200 text-left shadow-inner",
            open && "border-zinc-700 text-zinc-200 ring-4 ring-blue-500/10",
            className,
          )}
        >
          <div className="flex items-center gap-3 truncate w-full">
            <Search className="w-5 h-5 text-zinc-500 shrink-0" />
            <span className="truncate tracking-wide">
              {value ? value : placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-40 group-hover:opacity-70 transition-opacity" />
        </Button>
      </PopoverTrigger>

      {/* =====================================================
    CONTEÚDO DO POPOVER
    =====================================================

    Contém o campo de pesquisa e a lista dinâmica de
    resultados retornados pelo TMDB.
*/}

      <PopoverContent
        align="start"
        className={cn(
          "w-133 p-0 bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl overflow-hidden mt-2",
          popoverClassName,
        )}
      >
        {" "}
        <Command className="bg-zinc-950 text-white" shouldFilter={false}>
          {/* Campo onde o usuário digita o termo da pesquisa. */}

          <CommandInput
            placeholder={
              type === "person"
                ? "Digite o nome da celebridade..."
                : "Digite o nome oficial..."
            }
            value={value}
            onValueChange={setValue}
            className="border-none focus:ring-0 text-zinc-200 h-12 bg-zinc-950"
          />

          {/* Estado de carregamento da consulta */}

          <CommandList className="max-h-80 overflow-y-auto border-t border-zinc-900/80 custom-scrollbar">
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-zinc-400 gap-2.5 text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span>Consultando TMDB...</span>
              </div>
            )}

            {/* Nenhum resultado encontrado */}

            {!isLoading && search && data?.length === 0 && (
              <CommandEmpty className="py-8 text-center text-sm text-zinc-500 font-medium">
                Nenhum resultado encontrado.
              </CommandEmpty>
            )}

            {/* Estado inicial antes da pesquisa */}

            {!search && !isLoading && (
              <div className="py-8 text-center text-sm text-zinc-500 font-medium">
                Comece a digitar para carregar...
              </div>
            )}

            {/* =====================================================
             LISTA DE RESULTADOS
             =====================================================

             Cada item representa uma mídia retornada pelo TMDB.
             Ao selecionar um item, o componente envia os dados
             ao componente pai através da função onSelect().
            */}

            <CommandGroup>
              {data?.map((item: TMDBMediaItem) => {
                // Normaliza os dados recebidos da API para filmes,
                // séries e pessoas.

                const title = item.name || item.title || "Desconhecido";
                const releaseDate = item.first_air_date || item.release_date;
                const year =
                  releaseDate && type !== "person"
                    ? `(${releaseDate.split("-")[0]})`
                    : "";
                const imagePath = item.poster_path || item.profile_path || null;

                return (
                  <CommandItem
                    key={item.id}
                    value={title}
                    onSelect={() => {
                      setValue("");

                      // Envia a mídia selecionada para o componente pai
                      // e fecha automaticamente o Popover.

                      onSelect({
                        id: item.id,
                        title: title,
                        poster_path: imagePath,
                      });
                      setOpen(false);
                    }}
                    className="flex items-center justify-between py-3 px-4 hover:bg-zinc-900/60 cursor-pointer text-zinc-300 data-[selected='true']:bg-zinc-900 data-[selected='true']:text-white transition-colors"
                  >
                    <div className="flex items-center gap-4 truncate">
                      {/* Exibe o pôster da mídia ou um placeholder quando
                          não houver imagem disponível. */}

                      {imagePath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://image.tmdb.org/t/p/w185${imagePath}`}
                          alt={title}
                          className="w-14 h-20 object-cover rounded-xl bg-zinc-900 shrink-0 border border-zinc-800/80 shadow-lg"
                        />
                      ) : (
                        <div className="w-14 h-20 bg-zinc-900/80 rounded-xl border border-zinc-800/60 shrink-0 flex flex-col items-center justify-center gap-1 text-[10px] text-zinc-600 font-bold">
                          <User className="w-4 h-4 text-zinc-700" />
                          <span>N/A</span>
                        </div>
                      )}
                      <span className="font-bold text-sm tracking-tight truncate text-zinc-200">
                        {title}
                        {year && (
                          <span className="text-zinc-500 font-medium text-xs ml-1.5">
                            {year}
                          </span>
                        )}
                      </span>
                    </div>

                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 text-blue-500 opacity-0 transition-opacity",
                        value === title && "opacity-100",
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
