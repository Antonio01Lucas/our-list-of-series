"use client";

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
            placeholder={
              type === "person"
                ? "Digite o nome da celebridade..."
                : "Digite o nome oficial..."
            }
            value={value}
            onValueChange={setValue}
            className="border-none focus:ring-0 text-zinc-200 h-12 bg-zinc-950"
          />
          <CommandList className="max-h-80 overflow-y-auto border-t border-zinc-900/80 custom-scrollbar">
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-zinc-400 gap-2.5 text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span>Consultando TMDB...</span>
              </div>
            )}

            {!isLoading && search && data?.length === 0 && (
              <CommandEmpty className="py-8 text-center text-sm text-zinc-500 font-medium">
                Nenhum resultado encontrado.
              </CommandEmpty>
            )}

            {!search && !isLoading && (
              <div className="py-8 text-center text-sm text-zinc-500 font-medium">
                Comece a digitar para carregar...
              </div>
            )}

            <CommandGroup>
              {data?.map((item: TMDBMediaItem) => {
                const title = item.name || item.title || "Desconhecido";
                const releaseDate = item.first_air_date || item.release_date;
                const year =
                  releaseDate && type !== "person"
                    ? `(${releaseDate.split("-")[0]})`
                    : "";

                // 🌟 CORREÇÃO AQUI: adicionado o "|| null" no final do encadeamento para sanar o undefined
                const imagePath = item.poster_path || item.profile_path || null;

                return (
                  <CommandItem
                    key={item.id}
                    value={title}
                    onSelect={() => {
                      setValue("");
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
