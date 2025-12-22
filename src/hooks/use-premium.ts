import { useState, useEffect } from 'react'
import { 
  getSubscriptionStatus, 
  type SubscriptionData 
} from '@/lib/services/payments'

export interface PremiumStatus {
  isPremium: boolean
  subscription: SubscriptionData | null
  isLoading: boolean
  refresh: () => void
}

/**
 * Hook para gerenciar status Premium do usuário
 */
export function usePremiumStatus(userId: string): PremiumStatus {
  const [isPremium, setIsPremium] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadStatus = () => {
    setIsLoading(true)
    
    try {
      // Verificar localStorage
      const premiumFlag = localStorage.getItem('isPremium') === 'true'
      setIsPremium(premiumFlag)

      // Verificar assinatura
      const sub = getSubscriptionStatus(userId)
      setSubscription(sub)

      // Sincronizar status
      if (sub && sub.status === 'active') {
        const now = new Date()
        const expiresAt = new Date(sub.expiresAt)
        
        if (expiresAt > now) {
          setIsPremium(true)
          localStorage.setItem('isPremium', 'true')
        } else {
          setIsPremium(false)
          localStorage.setItem('isPremium', 'false')
        }
      } else {
        setIsPremium(false)
        localStorage.setItem('isPremium', 'false')
      }
    } catch (error) {
      console.error('Erro ao carregar status premium:', error)
      setIsPremium(false)
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isPremium' || e.key?.startsWith('subscription_')) {
        loadStatus()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [userId])

  return {
    isPremium,
    subscription,
    isLoading,
    refresh: loadStatus
  }
}

/**
 * Hook para verificar acesso a features premium
 */
export function usePremiumFeature(featureId: string, userId: string): {
  hasAccess: boolean
  isPremium: boolean
  isLoading: boolean
} {
  const { isPremium, isLoading } = usePremiumStatus(userId)

  // Lista de features que requerem premium
  const premiumFeatures = [
    'unlimited_predictions',
    'advanced_analysis',
    'platform_comparison',
    'real_time_odds',
    'custom_alerts',
    'full_history',
    'advanced_stats',
    'priority_support'
  ]

  const requiresPremium = premiumFeatures.includes(featureId)
  const hasAccess = !requiresPremium || isPremium

  return {
    hasAccess,
    isPremium,
    isLoading
  }
}

/**
 * Hook para limites de uso
 */
export function usePremiumLimits(userId: string) {
  const { isPremium } = usePremiumStatus(userId)

  const limits = {
    dailyPredictions: isPremium ? Infinity : 3,
    analysisDepth: isPremium ? 'advanced' : 'basic',
    platformComparison: isPremium,
    realTimeOdds: isPremium,
    customAlerts: isPremium,
    fullHistory: isPremium
  }

  return limits
}
