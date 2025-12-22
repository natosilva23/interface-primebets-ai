'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, BarChart3, Building2, User, ChevronLeft, Crown, TrendingUp, Lock, Sparkles, Target } from 'lucide-react'
import Link from 'next/link'
import { generatePlatformRanking, findValueOpportunities, type PlatformRanking } from '@/lib/ai/platform-comparison'
import { BettingPlatform } from '@/lib/types'

export default function PlataformasPage() {
  const [isPremium, setIsPremium] = useState(false)
  const [ranking, setRanking] = useState<PlatformRanking[]>([])
  const [valueOpportunities, setValueOpportunities] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const premium = localStorage.getItem('isPremium') === 'true'
    setIsPremium(premium)

    if (premium) {
      analyzeWithAI()
    }
  }, [])

  const platforms: BettingPlatform[] = [
    {
      id: 'bet365',
      name: 'Bet365',
      logo: '🎰',
      rating: 4.8,
      markets: [
        { sport: 'football', market: 'match_result', averageOdds: 1.85, commission: 4.5 },
        { sport: 'football', market: 'over_under', averageOdds: 1.90, commission: 4.0 },
        { sport: 'basketball', market: 'match_result', averageOdds: 1.88, commission: 4.2 },
      ]
    },
    {
      id: 'betano',
      name: 'Betano',
      logo: '🎲',
      rating: 4.6,
      markets: [
        { sport: 'football', market: 'match_result', averageOdds: 1.82, commission: 5.0 },
        { sport: 'football', market: 'both_score', averageOdds: 1.95, commission: 3.8 },
        { sport: 'tennis', market: 'match_result', averageOdds: 1.87, commission: 4.5 },
      ]
    },
    {
      id: 'blaze',
      name: 'Blaze',
      logo: '🔥',
      rating: 4.5,
      markets: [
        { sport: 'basketball', market: 'match_result', averageOdds: 1.92, commission: 3.5 },
        { sport: 'basketball', market: 'over_under', averageOdds: 1.88, commission: 4.0 },
        { sport: 'football', market: 'handicap', averageOdds: 1.90, commission: 4.2 },
      ]
    },
    {
      id: 'sportingbet',
      name: 'SportingBet',
      logo: '⚽',
      rating: 4.4,
      markets: [
        { sport: 'tennis', market: 'match_result', averageOdds: 1.93, commission: 3.2 },
        { sport: 'football', market: 'match_result', averageOdds: 1.80, commission: 5.5 },
        { sport: 'volleyball', market: 'match_result', averageOdds: 1.85, commission: 4.8 },
      ]
    },
    {
      id: '1xbet',
      name: '1xBet',
      logo: '🎯',
      rating: 4.3,
      markets: [
        { sport: 'football', market: 'match_result', averageOdds: 1.90, commission: 3.0 },
        { sport: 'basketball', market: 'match_result', averageOdds: 1.95, commission: 2.8 },
        { sport: 'tennis', market: 'over_under', averageOdds: 1.88, commission: 4.0 },
      ]
    }
  ]

  const analyzeWithAI = async () => {
    setIsAnalyzing(true)
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Gerar ranking com IA
    const aiRanking = generatePlatformRanking(platforms)
    setRanking(aiRanking)

    // Encontrar oportunidades de valor
    const opportunities = findValueOpportunities(platforms, 5)
    setValueOpportunities(opportunities)

    setIsAnalyzing(false)
  }

  const handlePlatformClick = () => {
    if (!isPremium) {
      router.push('/premium-required')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    return 'text-orange-600 bg-orange-100'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/home" className="inline-flex items-center gap-2 mb-4 text-white/90 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Comparador de Plataformas</h1>
              <p className="text-white/90 text-sm mt-1">Análise inteligente com IA</p>
            </div>
            {!isPremium && (
              <Crown className="w-8 h-8 text-amber-300" />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {!isPremium ? (
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Lock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">Recurso Premium</h3>
                <p className="text-white/90 text-sm mb-4">
                  Compare odds em tempo real e encontre as melhores oportunidades com IA
                </p>
                <Button
                  onClick={() => router.push('/premium')}
                  className="bg-white text-orange-600 hover:bg-white/90"
                >
                  Assinar Premium
                  <Crown className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Oportunidades de Valor */}
            {valueOpportunities.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6" />
                  <h3 className="text-lg font-bold">💎 Oportunidades de Valor Detectadas</h3>
                </div>
                
                <div className="space-y-3">
                  {valueOpportunities.slice(0, 3).map((opp, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-bold">{opp.match}</div>
                          <div className="text-sm text-white/80">{opp.market}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{opp.odds}</div>
                          <div className="text-xs text-white/80">odds</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/90">{opp.platform}</span>
                        <span className="font-bold text-amber-300">+{opp.valuePercentage.toFixed(1)}% vs média</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ranking IA */}
            {isAnalyzing ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <Sparkles className="w-12 h-12 text-emerald-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Analisando plataformas com IA...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900">Ranking Inteligente</h3>
                </div>

                {ranking.map((platform, index) => (
                  <div key={platform.platformId} className="border-2 border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-bold text-gray-300">#{index + 1}</div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{platform.platformName}</div>
                          <div className="text-sm text-gray-600">Odds médias: {platform.averageOdds}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(platform.score)}`}>
                        {platform.score}/100
                      </div>
                    </div>

                    {/* Pontos Fortes */}
                    {platform.strengths.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">✅ Pontos Fortes:</div>
                        <div className="flex flex-wrap gap-2">
                          {platform.strengths.map((strength, i) => (
                            <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pontos Fracos */}
                    {platform.weaknesses.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">⚠️ Pontos Fracos:</div>
                        <div className="flex flex-wrap gap-2">
                          {platform.weaknesses.map((weakness, i) => (
                            <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              {weakness}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Melhores Mercados */}
                    <div>
                      <div className="text-xs font-semibold text-gray-700 mb-1">🎯 Melhores Mercados:</div>
                      <div className="text-sm text-gray-600">{platform.bestMarkets.join(', ')}</div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Margem média:</span>
                      <span className="font-semibold text-gray-900">{platform.averageMargin}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Lista de Plataformas */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Todas as Plataformas</h3>
          
          {platforms.map((platform) => {
            const platformRanking = ranking.find(r => r.platformId === platform.id)
            
            return (
              <div
                key={platform.id}
                onClick={handlePlatformClick}
                className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all ${
                  isPremium ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-75'
                }`}
              >
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{platform.logo}</div>
                      <div>
                        <h3 className="text-xl font-bold">{platform.name}</h3>
                        <p className="text-white/90 text-sm">Rating: {platform.rating}/5</p>
                      </div>
                    </div>
                    {!isPremium && (
                      <Lock className="w-6 h-6 text-white/70" />
                    )}
                  </div>
                </div>

                {isPremium && platformRanking ? (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Score IA</span>
                      <span className={`font-bold px-2 py-1 rounded-full text-sm ${getScoreColor(platformRanking.score)}`}>
                        {platformRanking.score}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Odds médias</span>
                      <span className="font-semibold text-gray-900">{platformRanking.averageOdds}</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                      Ver Análise Completa
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm">Conteúdo bloqueado</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-around py-3">
          <Link href="/home" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/analise" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">Análises</span>
          </Link>
          <Link href="/plataformas" className="flex flex-col items-center gap-1 text-emerald-600">
            <Building2 className="w-6 h-6" />
            <span className="text-xs font-medium">Plataformas</span>
          </Link>
          <Link href="/perfil" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
