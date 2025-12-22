'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Crown, Lock, Sparkles } from 'lucide-react'

interface PremiumBlockProps {
  featureName: string
  description?: string
  benefits?: string[]
}

export function PremiumBlock({ 
  featureName, 
  description = 'Este recurso está disponível apenas para assinantes Premium',
  benefits = [
    'Palpites ilimitados',
    'Análise avançada com IA',
    'Comparador de plataformas',
    'Suporte prioritário 24/7'
  ]
}: PremiumBlockProps) {
  const router = useRouter()

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl p-8 text-center space-y-6 border-2 border-amber-200">
        {/* Icon */}
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {featureName}
          </h2>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-xl p-4 space-y-2 text-left">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Recursos Premium</span>
          </div>
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          onClick={() => router.push('/premium')}
          className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
        >
          <Crown className="mr-2 w-5 h-5" />
          Assinar Premium
        </Button>

        <p className="text-xs text-gray-500">
          A partir de R$ 19,90/mês • Cancele quando quiser
        </p>
      </div>
    </div>
  )
}

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function PremiumBadge({ size = 'md', showText = true }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-semibold ${sizeClasses[size]}`}>
      <Crown className={iconSizes[size]} />
      {showText && <span>Premium</span>}
    </div>
  )
}

interface PremiumFeatureWrapperProps {
  featureId: string
  featureName: string
  isPremium: boolean
  children: React.ReactNode
}

export function PremiumFeatureWrapper({
  featureId,
  featureName,
  isPremium,
  children
}: PremiumFeatureWrapperProps) {
  const premiumFeatures = [
    'unlimited_predictions',
    'advanced_analysis',
    'platform_comparison',
    'real_time_odds',
    'custom_alerts',
    'full_history',
    'advanced_stats'
  ]

  const requiresPremium = premiumFeatures.includes(featureId)

  if (requiresPremium && !isPremium) {
    return <PremiumBlock featureName={featureName} />
  }

  return <>{children}</>
}
