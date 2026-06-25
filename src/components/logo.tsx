// src/components/Logo.tsx
import Image from 'next/image'

interface LogoProps {
  vertical?: boolean // Nova propriedade opcional
}

export function Logo({ vertical = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${vertical ? 'flex-col' : ''}`}>
      <Image 
        src="/logo.png" 
        alt="SyncWatch Logo" 
        width={183} 
        height={100} 
        style={{ width: 'auto', height: 'auto' }} 
        priority 
      />
      <span className={`font-bold text-2xl tracking-tighter text-white ${vertical ? 'mt-2' : ''}`}>
        Sync<span className="text-blue-500">Watch</span>
      </span>
    </div>
  )
}