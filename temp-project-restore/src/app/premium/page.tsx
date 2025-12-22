'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Crown, Check, ChevronLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function PremiumPage() {
  const router = useRouter()

  const handleSubscribe = () => {
    router.push('/pagamento')
  }

  const features = {
    free: [
      'Palpites básicos do dia',
      'Análise de até 3 jogos/dia',
      'Estatísticas básicas',
      'Suporte por email'
    ],
    premium: [
      'Palpites ilimitados',
      'Análise avançada com IA',
      'Comparador de plataformas',
      'Odds em tempo real',
      'Alertas personalizados',
      'Histórico completo',
      'Estatísticas avançadas',
      'Suporte prioritário 24/7',
      'Acesso antecipado a novos recursos'
    ]
  }

  const plans = [
    {
      id: 'monthly',
      name: 'Mensal',
      price: 'R$ 29,90',
      period: '/mês',
      savings: null
    },
    {
      id: 'quarterly',
      name: 'Trimestral',
      price: 'R$ 24,90',
      period: '/mês',
      savings: 'Economize 17%',
      popular: true
    },
    {
      id: 'yearly',
      name: 'Anual',
      price: 'R$ 19,90',
      period: '/mês',
      savings: 'Economize 33%'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#0B1F3A] to-[#1A2942] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] text-[#0B1F3A] p-6 shadow-lg shadow-[#00E5FF]/20">
        <div className="max-w-4xl mx-auto">
          <Link href="/home" className="inline-flex items-center gap-2 mb-4 text-[#0B1F3A]/80 hover:text-[#0B1F3A]">
            <ChevronLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8" />
            <h1 className="text-2xl font-bold">VEXTOR AI Premium</h1>
          </div>
          <p className="text-[#0B1F3A]/80">Maximize seus ganhos com análises avançadas</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Planos */}
        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-[#0B1F3A] rounded-2xl shadow-md p-6 border-2 transition-all ${
                plan.popular
                  ? 'border-[#00E5FF] shadow-xl shadow-[#00E5FF]/20'
                  : 'border-[#1E3A5F]'
              }`}
            >
              {plan.popular && (
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[#00E5FF] to-[#6A5CFF] text-[#0B1F3A] px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  <Sparkles className="w-3 h-3" />
                  Mais Popular
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  {plan.savings && (
                    <p className="text-sm text-[#00E5FF] font-semibold">{plan.savings}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#00E5FF]">{plan.price}</div>
                  <div className="text-sm text-gray-400">{plan.period}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparação */}
        <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-2xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#00E5FF] to-[#6A5CFF] text-[#0B1F3A] p-4">
            <h2 className="text-lg font-bold">Comparação de Recursos</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Free */}
            <div>
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                Plano Gratuito
              </h3>
              <div className="space-y-2">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium */}
            <div>
              <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#00E5FF]" />
                Plano Premium
              </h3>
              <div className="space-y-2">
                {features.premium.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-white">
                    <Check className="w-5 h-5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] text-[#0B1F3A] rounded-2xl p-6 text-center space-y-4 shadow-xl shadow-[#00E5FF]/20">
          <h3 className="text-xl font-bold">Pronto para começar?</h3>
          <p className="text-[#0B1F3A]/80">
            Junte-se a milhares de apostadores que já aumentaram seus lucros
          </p>
          <Button
            onClick={handleSubscribe}
            className="w-full bg-[#0B1F3A] text-[#00E5FF] hover:bg-[#0B1F3A]/90 h-12 text-lg font-semibold shadow-lg"
          >
            Assinar Agora
            <Crown className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-xs text-[#0B1F3A]/70">
            Cancele quando quiser • Garantia de 7 dias
          </p>
        </div>
      </div>
    </div>
  )
}
