'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Definimos o formato do nosso estado para o TypeScript entender
type ActionState = {
  error: string
}

export async function addSeries(_prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  
  // 1. Verifica quem está logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Usuário não autenticado' }
  }

  // ... resto do seu código permanece igual

  // 2. Pega os dados do form
  const title = formData.get('title') as string
  const status = formData.get('status') as string

  // 3. Salva no banco
  const { error } = await supabase.from('series').insert({
    user_id: user.id,
    title,
    status
  })

  if (error) {
    return { error: error.message }
  }

  // 4. Se deu certo, atualiza a home e redireciona
  revalidatePath('/')
  redirect('/')
}