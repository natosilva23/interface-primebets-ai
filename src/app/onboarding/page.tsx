'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TrendingUp, BarChart3, Target, ChevronRight, Zap } from 'lucide-react'

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()

  const screens = [
    {
      icon: <Zap className="w-24 h-24 text-[#00E5FF]" />,
      title: 'Bem-vindo ao VEXTOR AI',
      description: 'A plataforma inteligente para apostas esportivas com análise baseada em IA'
    },
    {
      icon: <BarChart3 className="w-24 h-24 text-[#00E5FF]" />,
      title: 'Análise Inteligente',
      description: 'Receba palpites personalizados com base em estatísticas avançadas e seu perfil de apostador'
    },
    {
      icon: <Target className="w-24 h-24 text-[#00E5FF]" />,
      title: 'Filtros Inteligentes',
      description: 'Compare odds, encontre as melhores oportunidades e maximize seus ganhos'
    }
  ]

  const handleNext = () => {
    if (step < screens.length - 1) {
      setStep(step + 1)
    } else {
      localStorage.setItem('hasSeenOnboarding', 'true')
      router.push('/login')
    }
  }

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-gradient-to-br from-[#0A0E1A] via-[#0B1F3A] to-[#1A2942] p-6 text-white">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        <div className="animate-fade-in">
          {screens[step].icon}
        </div>
        <div className="space-y-4 max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold animate-fade-in bg-gradient-to-r from-[#00E5FF] to-[#6A5CFF] bg-clip-text text-transparent">
            {screens[step].title}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 animate-fade-in">
            {screens[step].description}
          </p>
        </div>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center gap-2">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === step ? 'w-8 bg-[#00E5FF]' : 'w-2 bg-[#00E5FF]/40'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-[#00E5FF] to-[#6A5CFF] text-[#0B1F3A] hover:from-[#00B8D4] hover:to-[#5A4CFF] h-12 text-lg font-semibold shadow-lg shadow-[#00E5FF]/20"
        >
          {step < screens.length - 1 ? 'Próximo' : 'Começar'}
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
