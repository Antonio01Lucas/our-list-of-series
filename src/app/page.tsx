import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Verifica se existe um usuário logado
  const { data: { user } } = await supabase.auth.getUser()

  // Se não tiver usuário, manda pro login na hora
  if (!user) {
    redirect('/login')
  }

  // Função para fazer logout
  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/')
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold text-blue-500">SyncWatch</h1>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{user.email}</span>
            <form action={signOut}>
              <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded transition-colors text-sm font-medium border border-zinc-700">
                Sair
              </button>
            </form>
          </div>
        </header>
        
        <main>
          <h2 className="text-2xl font-semibold mb-6">Suas Séries</h2>
          
          {/* Caixa temporária onde as séries vão ficar no futuro */}
          <div className="border border-zinc-800 bg-zinc-900/50 rounded-xl p-12 flex flex-col items-center justify-center border-dashed">
            <p className="text-zinc-500 mb-4">Você ainda não adicionou nenhuma série.</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
              + Adicionar Nova Série
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}