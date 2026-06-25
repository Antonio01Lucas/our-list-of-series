import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Logo } from '@/components/logo' // Importando nossa logo

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: series } = await supabase
    .from('series')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
          <Logo /> {/* Logo inserida */}
          <div className="flex items-center gap-6">
            <span className="text-sm text-zinc-400 font-medium">{user.email}</span>
            <form action={async () => { 'use server'; const s = await createClient(); await s.auth.signOut(); revalidatePath('/'); redirect('/login'); }}>
              <button className="text-sm text-zinc-500 hover:text-white transition-colors">Sair</button>
            </form>
          </div>
        </header>
        
        <main>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Suas Séries</h2>
              <p className="text-zinc-400">Gerencie o que você está assistindo agora.</p>
            </div>
            <Link href="/series/new" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-blue-900/20">
              + Adicionar Série
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {series?.map((serie) => (
              <div key={serie.id} className="group bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all hover:bg-zinc-900">
                <h3 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">{serie.title}</h3>
                <span className="inline-block bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider">{serie.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}