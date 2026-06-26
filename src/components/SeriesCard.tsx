"use client";

import { useState } from "react";
import { updateSeriesProgress } from "@/actions/series";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 1. Definimos a estrutura exata da sua Série
interface Serie {
  id: string | number; // Aceita tanto string quanto number
  title: string;
  status: string;
  current_season: number;
  current_episode: number;
}

export function SeriesCard({ serie }: { serie: Serie }) {
  const [open, setOpen] = useState(false);

  // Garantimos que o ID seja um número, já que sua action espera 'number'
  const numericId = Number(serie.id);

  async function handleSubmit(formData: FormData) {
    const season = Number(formData.get("season"));
    const episode = Number(formData.get("episode"));

    await updateSeriesProgress(numericId, {
      current_season: season,
      current_episode: episode,
    });
    setOpen(false);
  }

  return (
    <div className="group bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
      <h3 className="font-bold text-lg mb-1">{serie.title}</h3>
      <p className="text-sm text-zinc-400 mb-4">
        Temporada: {serie.current_season || 1} | Episódio:{" "}
        {serie.current_episode || 1}
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            Editar Progresso
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar {serie.title}</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Temporada</label>
              <Input
                name="season"
                type="number"
                defaultValue={serie.current_season || 1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Episódio</label>
              <Input
                name="episode"
                type="number"
                defaultValue={serie.current_episode || 1}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
