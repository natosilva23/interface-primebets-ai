'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home as HomeIcon, BarChart3, Building2, User, Zap, Target, Crown, ChevronRight, Bell, Sparkles, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { generateDailyAdvice, analyzeMarketConditions, getTimeBasedAdvice, getWeekdayAdvice } from '@/lib/ai/advisory'
import { alertSystem, generateDailyAlertSummary } from '@/lib/ai/alerts'
import { BettorStyle } from '@/lib/types'
import PWAInstallBanner from '@/components/custom/pwa-install-banner'

function HomePageContent() {
  const [userProfile, setUserProfile] = useState('')
  const [userStyle, setUserStyle] = useState<BettorStyle>('balanced')
  const [dailyAdvice, setDailyAdvice] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Detectar modo admin via URL
    const adminParam = searchParams.get('admin')
    setIsAdmin(adminParam === '1')

    const profile = localStorage.getItem('userProfileName') || 'Equilibrado'
    setUserProfile(profile)

    // Carregar estilo do usuário
    const user = localStorage.getItem('currentUser')
    if (user) {
      try {
        const userData = JSON.parse(user)
        setUserStyle(userData.bettorStyle || 'balanced')
      } catch (e) {
        console.error('Erro ao carregar usuário:', e)
      }
    }

    // Gerar conselho diário
    const marketConditions = analyzeMarketConditions()
    const advice = generateDailyAdvice(
      userStyle,
      { wins: 5, losses: 3, streak: 2, totalProfit: 150 },
      marketConditions
    )
    setDailyAdvice(advice)

    // Carregar alertas
    const userId = user ? JSON.parse(user).id : 'guest'
    const activeAlerts = alertSystem.getActiveAlerts(userId)
    setAlerts(activeAlerts.slice(0, 3)) // Mostrar apenas 3 mais recentes
  }, [searchParams])

  const todayPicks = [
    {
      id: 1,
      match: 'Flamengo vs Palmeiras',
      league: 'Brasileirão Série A',
      prediction: 'Mais de 2.5 gols',
      confidence: 87,
      odds: 1.85,
      time: 'Hoje às 19:00'
    },
    {
      id: 2,
      match: 'Real Madrid vs Barcelona',
      league: 'La Liga',
      prediction: 'Ambos marcam',
      confidence: 92,
      odds: 1.72,
      time: 'Hoje às 16:00'
    },
    {
      id: 3,
      match: 'Lakers vs Warriors',
      league: 'NBA',
      prediction: 'Lakers vence',
      confidence: 78,
      odds: 2.10,
      time: 'Hoje às 22:30'
    }
  ]

  const recommendations = [
    {
      id: 1,
      title: 'Apostas de Valor',
      description: 'Encontramos 5 oportunidades com odds acima da média',
      icon: <Target className="w-6 h-6" />,
      color: 'from-[#00E5FF] to-[#00B8D4]'
    },
    {
      id: 2,
      title: 'Sequências Quentes',
      description: 'Times em boa fase com alta probabilidade de vitória',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-[#6A5CFF] to-[#8B7CFF]'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#0B1F3A] to-[#1A2942] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] text-[#0B1F3A] p-6 rounded-b-3xl shadow-lg shadow-[#00E5FF]/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Olá, Apostador!</h1>
              <p className="text-[#0B1F3A]/80 text-sm">
                Perfil: {userProfile}
                {isAdmin && <span className="ml-2 bg-[#0B1F3A]/30 px-2 py-0.5 rounded text-xs font-bold">ADMIN</span>}
              </p>
            </div>
            <div className="bg-[#0B1F3A]/20 backdrop-blur-sm p-3 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 space-y-6">
        {/* Conselho Diário da IA */}
        {dailyAdvice && (
          <div className="bg-gradient-to-br from-[#6A5CFF] to-[#8B7CFF] text-white rounded-2xl p-6 shadow-xl shadow-[#6A5CFF]/20">
            <div className="flex items-start gap-3 mb-3">
              <Sparkles className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">💡 Conselho do Dia</h3>
                <p className="text-white/90 text-sm mb-3">{dailyAdvice.mainMessage}</p>
                
                {dailyAdvice.tips.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 space-y-1">
                    {dailyAdvice.tips.slice(0, 2).map((tip: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-white/80">•</span>
                        <span className="text-white/90">{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alertas Ativos */}
        {alerts.length > 0 && (
          <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-2xl shadow-md p-6 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-[#00E5FF]" />
              <h3 className="font-bold text-white">🔔 Alertas Ativos</h3>
            </div>
            
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border-2 ${
                  alert.priority === 'urgent' ? 'border-red-400 bg-red-500/10' :
                  alert.priority === 'high' ? 'border-orange-400 bg-orange-500/10' :
                  'border-[#00E5FF] bg-[#00E5FF]/10'
                }`}
              >
                <div className="font-semibold text-white text-sm mb-1">{alert.title}</div>
                <div className="text-xs text-gray-400">{alert.message}</div>
              </div>
            ))}
          </div>
        )}

        {/* Premium Card - Ocultar no modo admin */}
        {!isAdmin && (
          <div className="bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] text-[#0B1F3A] rounded-2xl p-6 shadow-xl shadow-[#00E5FF]/20">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6" />
                  <h3 className="text-xl font-bold">VEXTOR AI Premium</h3>
                </div>
                <p className="text-[#0B1F3A]/80 text-sm">
                  Desbloqueie análises avançadas e comparador de plataformas
                </p>
                <Button
                  onClick={() => router.push('/premium')}
                  className="bg-[#0B1F3A] text-[#00E5FF] hover:bg-[#0B1F3A]/90 mt-3 shadow-lg"
                >
                  Assinar agora
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Palpites do Dia - Modo admin mostra tudo completo */}
        <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">
            Palpites do Dia
            {isAdmin && <span className="ml-2 text-sm text-[#00E5FF]">(Modo Admin - Todos visíveis)</span>}
          </h2>
          <div className="space-y-3">
            {todayPicks.map((pick) => (
              <div
                key={pick.id}
                className="border border-[#1E3A5F] bg-[#1A2942] rounded-xl p-4 hover:border-[#00E5FF] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{pick.match}</h3>
                    <p className="text-sm text-gray-400">{pick.league}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#00E5FF]">
                      {pick.odds.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">odds</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#00E5FF]/20 text-[#00E5FF] px-3 py-1 rounded-full text-sm font-medium">
                      {pick.prediction}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-400">
                      Confiança: <span className="font-semibold text-[#00E5FF]">{pick.confidence}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">{pick.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recomendações */}
        <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Recomendações para Você</h2>
          <div className="grid gap-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`bg-gradient-to-br ${rec.color} text-white rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    {rec.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{rec.title}</h3>
                    <p className="text-sm text-white/90">{rec.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dicas Contextuais */}
        <div className="bg-gradient-to-br from-[#6A5CFF] to-[#8B7CFF] text-white rounded-2xl p-6 shadow-xl shadow-[#6A5CFF]/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold mb-2">💬 Dica Contextual</h3>
              <p className="text-white/90 text-sm mb-2">{getTimeBasedAdvice()}</p>
              <p className="text-white/80 text-xs">{getWeekdayAdvice()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B1F3A] border-t border-[#1E3A5F] shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-around py-3">
          <Link href="/home" className="flex flex-col items-center gap-1 text-[#00E5FF]">
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/analise" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00E5FF]">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">Análises</span>
          </Link>
          <Link href="/plataformas" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00E5FF]">
            <Building2 className="w-6 h-6" />
            <span className="text-xs font-medium">Plataformas</span>
          </Link>
          <Link href="/perfil" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00E5FF]">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#0B1F3A] to-[#1A2942] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}
