import { addSeries } from "@/actions/series";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function NewSeriesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Adicionar nova série</h1>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Voltar para Dashboard
          </Link>
        </div>

        <form
          action={addSeries}
          className="space-y-4 bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Título da Série
            </label>
            <Input
              name="title"
              placeholder="Ex: Breaking Bad"
              required
              className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Status Inicial
            </label>
            <select
              name="status"
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-blue-500"
            >
              <option value="assistir">Quero Assistir</option>
              <option value="assistindo">Assistindo</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            Salvar Série
          </Button>
        </form>
      </div>
    </div>
  );
}
