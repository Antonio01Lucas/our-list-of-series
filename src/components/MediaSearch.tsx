"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
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

// 1. Criamos a interface com a estrutura exata que vem da API do TMDB
interface TMDBMediaItem {
  id: number;
  name?: string;
  title?: string;
  first_air_date?: string;
  release_date?: string;
  poster_path: string | null;
}

interface MediaSearchProps {
  type: "tv" | "movie";
  placeholder?: string;
  onSelect: (media: {
    id: number;
    title: string;
    poster_path: string | null;
  }) => void;
}

export function MediaSearch({
  type,
  placeholder = "Pesquisar...",
  onSelect,
}: MediaSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(value);
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  // Tipamos o useQuery com <TMDBMediaItem[]> para o Next saber o que esperar no 'data'
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-12 justify-between bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900 rounded-xl px-4 font-medium transition-all duration-200 text-left",
            open && "border-zinc-700 text-zinc-200 ring-2 ring-blue-500/20",
          )}
        >
          <div className="flex items-center gap-2.5 truncate w-full">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="truncate">{value ? value : placeholder}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width)] p-0 bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl overflow-hidden mt-1">
        <Command className="bg-zinc-950 text-white" shouldFilter={false}>
          <CommandInput
            placeholder="Digite o nome oficial..."
            value={value}
            onValueChange={setValue}
            className="border-none focus:ring-0 text-zinc-200 h-12 bg-zinc-950"
          />
          <CommandList className="max-h-70 overflow-y-auto border-t border-zinc-900/80 custom-scrollbar">
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-zinc-400 gap-2.5 text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span>Consultando TMDB...</span>
              </div>
            )}

            {!isLoading && search && data?.length === 0 && (
              <CommandEmpty className="py-8 text-center text-sm text-zinc-500 font-medium">
                Nenhum título encontrado com esse nome.
              </CommandEmpty>
            )}

            {!search && !isLoading && (
              <div className="py-8 text-center text-sm text-zinc-500 font-medium">
                Comece a digitar para carregar o catálogo...
              </div>
            )}

            <CommandGroup>
              {/* O loop agora usa a interface TMDBMediaItem em vez de any */}
              {data?.map((item: TMDBMediaItem) => {
                const title = item.name || item.title || "Título Desconhecido";
                const releaseDate = item.first_air_date || item.release_date;
                const year = releaseDate
                  ? `(${releaseDate.split("-")[0]})`
                  : "";

                return (
                  <CommandItem
                    key={item.id}
                    value={title}
                    onSelect={() => {
                      setValue(title);
                      onSelect({
                        id: item.id,
                        title: title,
                        poster_path: item.poster_path,
                      });
                      setOpen(false);
                    }}
                    className="flex items-center justify-between py-3.5 px-4 hover:bg-zinc-900/60 cursor-pointer text-zinc-300 data-[selected='true']:bg-zinc-900 data-[selected='true']:text-white transition-colors"
                  >
                    <div className="flex items-center gap-3.5 truncate">
                      {item.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                          alt={title}
                          className="w-8 h-12 object-cover rounded-lg bg-zinc-900 shrink-0 border border-zinc-800/80 shadow-md"
                        />
                      ) : (
                        <div className="w-8 h-12 bg-zinc-900/80 rounded-lg border border-zinc-800/60 shrink-0 flex items-center justify-center text-[10px] text-zinc-600 font-bold">
                          N/A
                        </div>
                      )}
                      <span className="font-semibold text-sm tracking-tight truncate text-zinc-200">
                        {title}
                        <span className="text-zinc-500 font-medium text-xs ml-1.5">
                          {year}
                        </span>
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
