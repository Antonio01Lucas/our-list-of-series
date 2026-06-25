'use client'

import { useActionState } from 'react' 
import { useRouter } from 'next/navigation'
import { addSeries } from './actions' // Importando a ação que criamos

export default function NewSeriesPage() {
  const router = useRouter()
  
  // Conectando o estado da ação
  const [state, formAction] = useActionState(addSeries, { error: '' })

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-500">Nova Série</h1>
        
        {/* Passamos o formAction do hook para o form */}
        <form action={formAction} className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl flex flex-col gap-4">
          
          {state?.error && (
            <p className="text-red-400 bg-red-950/30 p-3 rounded border border-red-900 text-sm">
              {state.error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-400">Nome da Série</label>
            <input 
              name="title" 
              type="text" 
              required
              placeholder="Ex: Breaking Bad"
              className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded text-white focus:outline-none focus:border-blue-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-400">Status</label>
            <select name="status" className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded text-white focus:outline-none focus:border-blue-500">
              <option value="plan_to_watch">Planejo Assistir</option>
              <option value="watching">Assistindo</option>
              <option value="watched">Concluída</option>
            </select>
          </div>

          <div className="flex gap-4 mt-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 p-3 rounded transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded font-medium transition-colors"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}