'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para onboarding na primeira visita
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      router.push('/onboarding')
    } else {
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      if (!isAuthenticated) {
        router.push('/login')
      } else {
        router.push('/home')
      }
    }
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0A0E1A] via-[#0B1F3A] to-[#1A2942]">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#00E5FF] border-t-transparent mx-auto"></div>
        <p className="text-[#00E5FF] font-semibold">Carregando VEXTOR AI...</p>
      </div>
    </div>
  )
}
