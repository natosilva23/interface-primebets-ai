'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Home, BarChart3, Building2, User, ChevronLeft, TrendingUp, Target, AlertCircle, Sparkles, Brain } from 'lucide-react'
import Link from 'next/link'
import { generateCompleteAIAnalysis, type AIAnalysisResponse } from '@/lib/ai'
import { BettorStyle } from '@/lib/types'

export default function AnalisePage() {
  const [selectedSport, setSelectedSport] = useState('')
  const [selectedMarket, setSelectedMarket] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null)
  const [userStyle, setUserStyle] = useState<BettorStyle>('balanced')

  useEffect(() => {
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
  }, [])

  const sports = [
    { id: 'football', name: 'Futebol', icon: '⚽' },
    { id: 'basketball', name: 'Basquete', icon: '🏀' },
    { id: 'tennis', name: 'Tênis', icon: '🎾' },
    { id: 'volleyball', name: 'Vôlei', icon: '🏐' }
  ]

  const markets = [
    { id: 'match_result', name: 'Vencedor da Partida' },
    { id: 'over_under', name: 'Total de Gols' },
    { id: 'both_score', name: 'Ambos Marcam' },
    { id: 'handicap', name: 'Handicap Asiático' }
  ]

  const handleAnalyze = async () => {
    if (selectedSport && selectedMarket) {
      setIsAnalyzing(true)
      
      // Simular delay de processamento da IA
      await new Promise(resolve => setTimeout(resolve, 2000))

      try {
        const user = localStorage.getItem('currentUser')
        const userId = user ? JSON.parse(user).id : 'guest'
        const bankroll = 1000 // Em produção, viria do perfil do usuário

        const analysis = await generateCompleteAIAnalysis({
          userId,
          userStyle,
          bankroll,
          match: {
            homeTeam: 'Flamengo',
            awayTeam: 'Palmeiras',
            sport: selectedSport,
            market: selectedMarket,
          },
        })

        setAiAnalysis(analysis)
        setShowResults(true)
      } catch (error) {
        console.error('Erro ao gerar análise:', error)
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'high':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'conservative':
        return 'Conservador'
      case 'balanced':
        return 'Balanceado'
      case 'highRisk':
        return 'Alto Risco'
      default:
        return level
    }
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
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Análise com IA</h1>
              <p className="text-white/90 text-sm mt-1">Palpites personalizados com inteligência artificial</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {!showResults ? (
          <>
            {/* Seleção de Esporte */}
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Escolha o Esporte</h2>
              <div className="grid grid-cols-2 gap-3">
                {sports.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => setSelectedSport(sport.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedSport === sport.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{sport.icon}</div>
                    <div className="font-semibold text-gray-900">{sport.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Seleção de Mercado */}
            {selectedSport && (
              <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 animate-fade-in">
                <h2 className="text-lg font-bold text-gray-900">Escolha o Mercado</h2>
                <div className="space-y-2">
                  {markets.map((market) => (
                    <button
                      key={market.id}
                      onClick={() => setSelectedMarket(market.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedMarket === market.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{market.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botão Analisar */}
            {selectedSport && selectedMarket && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 h-12 text-lg font-semibold animate-fade-in"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="mr-2 w-5 h-5 animate-spin" />
                    Analisando com IA...
                  </>
                ) : (
                  <>
                    Gerar Análise com IA
                    <TrendingUp className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            )}
          </>
        ) : aiAnalysis ? (
          <>
            {/* Resultados da IA */}
            <div className="space-y-4">
              <Button
                onClick={() => {
                  setShowResults(false)
                  setAiAnalysis(null)
                }}
                variant="outline"
                className="mb-2"
              >
                <ChevronLeft className="mr-2 w-4 h-4" />
                Nova Análise
              </Button>

              {/* Probabilidades */}
              <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900">Probabilidades Calculadas pela IA</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-600">{aiAnalysis.probabilities.homeWin}%</div>
                    <div className="text-sm text-gray-600 mt-1">Vitória Casa</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-600">{aiAnalysis.probabilities.draw}%</div>
                    <div className="text-sm text-gray-600 mt-1">Empate</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{aiAnalysis.probabilities.awayWin}%</div>
                    <div className="text-sm text-gray-600 mt-1">Vitória Fora</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-emerald-100 rounded-lg">
                  <Target className="w-5 h-5 text-emerald-700" />
                  <span className="text-sm font-semibold text-emerald-700">
                    Confiança da IA: {aiAnalysis.probabilities.confidence}%
                  </span>
                </div>
              </div>

              {/* Recomendação Personalizada */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-md p-6 text-white space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Recomendação Personalizada para Você</h3>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xl font-bold">{aiAnalysis.personalizedRecommendation.recommendation.prediction}</div>
                      <div className="text-white/80 text-sm mt-1">Perfil: {getRiskLabel(userStyle)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{aiAnalysis.personalizedRecommendation.recommendation.odds}</div>
                      <div className="text-xs text-white/80">odds</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Stake Recomendado:</span>
                    <span className="font-bold">R$ {aiAnalysis.personalizedRecommendation.stake.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Retorno Potencial:</span>
                    <span className="font-bold">R$ {aiAnalysis.personalizedRecommendation.potentialReturn.toFixed(2)}</span>
                  </div>

                  <div className="pt-3 border-t border-white/20">
                    <p className="text-sm text-white/90">{aiAnalysis.personalizedRecommendation.advice}</p>
                  </div>
                </div>
              </div>

              {/* Todas as Recomendações */}
              <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Todas as Recomendações</h3>
                
                {Object.entries(aiAnalysis.recommendations).map(([level, rec]) => (
                  <div key={level} className="border-2 border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                          level === 'conservative' ? 'bg-green-100 text-green-700' :
                          level === 'balanced' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {getRiskLabel(level)}
                        </div>
                        <div className="font-bold text-gray-900">{rec.prediction}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-emerald-600">{rec.odds}</div>
                        <div className="text-xs text-gray-500">odds</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Confiança</span>
                        <span className="font-semibold text-emerald-600">{rec.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all"
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                      {rec.reasoning}
                    </div>
                  </div>
                ))}
              </div>

              {/* Conselhos da IA */}
              {aiAnalysis.advice.mainMessage && (
                <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Conselhos da IA</h3>
                  
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-blue-900 font-medium">{aiAnalysis.advice.mainMessage}</p>
                  </div>

                  {aiAnalysis.advice.tips.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 text-sm">💡 Dicas:</h4>
                      {aiAnalysis.advice.tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-emerald-600">•</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {aiAnalysis.advice.warnings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 text-sm">⚠️ Avisos:</h4>
                      {aiAnalysis.advice.warnings.map((warning, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-orange-600">
                          <span>•</span>
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Alertas */}
              {aiAnalysis.alerts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">🔔 Alertas Ativos</h3>
                  
                  {aiAnalysis.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border-2 ${
                        alert.priority === 'urgent' ? 'border-red-300 bg-red-50' :
                        alert.priority === 'high' ? 'border-orange-300 bg-orange-50' :
                        'border-blue-300 bg-blue-50'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{alert.title}</div>
                      <div className="text-sm text-gray-600">{alert.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-around py-3">
          <Link href="/home" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/analise" className="flex flex-col items-center gap-1 text-emerald-600">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">Análises</span>
          </Link>
          <Link href="/plataformas" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600">
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
