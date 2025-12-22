'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Lock, Crown, X } from 'lucide-react'

export default function PremiumRequiredPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6 relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-full">
            <Lock className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Função Disponível Apenas no Premium
          </h2>
          <p className="text-gray-600">
            Desbloqueie análises avançadas, comparador de plataformas e muito mais
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3 text-left">
            <div className="bg-amber-500 text-white p-2 rounded-lg">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Comparador de Plataformas</div>
              <div className="text-sm text-gray-600">Encontre as melhores odds</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="bg-amber-500 text-white p-2 rounded-lg">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Análises Ilimitadas</div>
              <div className="text-sm text-gray-600">Sem limites diários</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-left">
            <div className="bg-amber-500 text-white p-2 rounded-lg">
              <Crown className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Alertas em Tempo Real</div>
              <div className="text-sm text-gray-600">Nunca perca uma oportunidade</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/premium')}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 h-12 text-lg font-semibold"
          >
            Assinar Premium
            <Crown className="ml-2 w-5 h-5" />
          </Button>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full h-12"
          >
            Voltar
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          A partir de R$ 19,90/mês • Cancele quando quiser
        </p>
      </div>
    </div>
  )
}
