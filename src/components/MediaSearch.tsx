"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils"; // Certifique-se que este arquivo existe na pasta lib
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

// Interface para tipagem dos resultados do TMDB
interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string;
}

interface MediaSearchProps {
  type: "movie" | "tv";
  onSelect: (media: { id: number; title: string; poster_path: string }) => void;
  placeholder?: string;
}

export function MediaSearch({ type, onSelect, placeholder }: MediaSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // Debounce para não sobrecarregar a API
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["tmdbSearch", type, debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return { results: [] };
      const res = await fetch(
        `/api/search?type=${type}&query=${encodeURIComponent(debouncedSearch)}`,
      );
      if (!res.ok) throw new Error("Falha na busca");
      return res.json();
    },
    enabled: debouncedSearch.length > 2,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          // Agora estamos usando o cn! O ESLint vai parar de reclamar
          className={cn("w-full justify-between", open && "bg-accent")}
        >
          {placeholder || "Buscar título..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="'w-75' p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Pesquisar..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading && (
              <div className="flex justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!isLoading &&
              debouncedSearch.length > 2 &&
              data?.results?.length === 0 && (
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              )}
            <CommandGroup>
              {data?.results?.slice(0, 5).map((item: TMDBResult) => {
                const title = item.title || item.name || "Sem título";
                const date = item.release_date || item.first_air_date;
                const year = date ? ` (${date.split("-")[0]})` : "";

                return (
                  <CommandItem
                    key={item.id}
                    value={item.id.toString()}
                    onSelect={() => {
                      onSelect({
                        id: item.id,
                        title,
                        poster_path: item.poster_path,
                      });
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    {title}
                    {year}
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
