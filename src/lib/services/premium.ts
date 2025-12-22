// ============================================
// SERVIÇO: SISTEMA PREMIUM
// ============================================

import { PremiumSubscription, User } from '../types';
import { PREMIUM_FEATURES, APP_CONFIG } from '../constants/betting';

/**
 * Verifica se usuário tem assinatura premium ativa
 */
export function isPremiumUser(userId: string): boolean {
  const subscription = getUserSubscription(userId);
  
  if (!subscription) return false;
  if (subscription.status !== 'active') return false;
  
  // Verificar se não expirou
  const now = new Date();
  const expiresAt = new Date(subscription.expiresAt);
  
  return expiresAt > now;
}

/**
 * Obtém assinatura do usuário
 */
export function getUserSubscription(userId: string): PremiumSubscription | null {
  const data = localStorage.getItem(`subscription_${userId}`);
  if (!data) return null;

  try {
    const subscription = JSON.parse(data);
    return {
      ...subscription,
      startDate: new Date(subscription.startDate),
      expiresAt: new Date(subscription.expiresAt),
    };
  } catch {
    return null;
  }
}

/**
 * Cria nova assinatura premium
 */
export function createSubscription(
  userId: string,
  plan: 'monthly' | 'yearly'
): PremiumSubscription {
  const now = new Date();
  const expiresAt = new Date(now);

  // Calcular data de expiração
  if (plan === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }

  const subscription: PremiumSubscription = {
    userId,
    plan,
    status: 'active',
    startDate: now,
    expiresAt,
    autoRenew: true,
  };

  // Salvar assinatura
  localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));

  return subscription;
}

/**
 * Cancela assinatura premium
 */
export function cancelSubscription(userId: string): boolean {
  const subscription = getUserSubscription(userId);
  
  if (!subscription) return false;

  subscription.status = 'cancelled';
  subscription.autoRenew = false;

  localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));

  return true;
}

/**
 * Renova assinatura premium
 */
export function renewSubscription(userId: string): PremiumSubscription | null {
  const subscription = getUserSubscription(userId);
  
  if (!subscription) return null;

  const now = new Date();
  const newExpiresAt = new Date(now);

  if (subscription.plan === 'monthly') {
    newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);
  } else {
    newExpiresAt.setFullYear(newExpiresAt.getFullYear() + 1);
  }

  subscription.status = 'active';
  subscription.expiresAt = newExpiresAt;

  localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));

  return subscription;
}

/**
 * Verifica se feature específica requer premium
 */
export function requiresPremium(featureId: string): boolean {
  const feature = PREMIUM_FEATURES.find((f) => f.id === featureId);
  return feature?.isPremium || false;
}

/**
 * Verifica acesso a feature e lança erro se não tiver permissão
 */
export function checkFeatureAccess(userId: string, featureId: string): void {
  if (!requiresPremium(featureId)) return;

  if (!isPremiumUser(userId)) {
    throw new Error('PREMIUM_REQUIRED');
  }
}

/**
 * Obtém limite de palpites por dia baseado no plano
 */
export function getDailyPredictionLimit(userId: string): number {
  return isPremiumUser(userId)
    ? APP_CONFIG.PREMIUM_PREDICTIONS_PER_DAY
    : APP_CONFIG.FREE_PREDICTIONS_PER_DAY;
}

/**
 * Verifica se usuário atingiu limite diário de palpites
 */
export function hasReachedDailyLimit(userId: string): boolean {
  const limit = getDailyPredictionLimit(userId);
  const count = getDailyPredictionCount(userId);
  
  return count >= limit;
}

/**
 * Obtém contagem de palpites do dia
 */
function getDailyPredictionCount(userId: string): number {
  const today = new Date().toISOString().split('T')[0];
  const key = `predictions_count_${userId}_${today}`;
  const count = localStorage.getItem(key);
  
  return count ? parseInt(count, 10) : 0;
}

/**
 * Incrementa contagem de palpites do dia
 */
export function incrementDailyPredictionCount(userId: string): void {
  const today = new Date().toISOString().split('T')[0];
  const key = `predictions_count_${userId}_${today}`;
  const count = getDailyPredictionCount(userId);
  
  localStorage.setItem(key, (count + 1).toString());
}

/**
 * Obtém dias restantes da assinatura
 */
export function getDaysRemaining(userId: string): number {
  const subscription = getUserSubscription(userId);
  
  if (!subscription || subscription.status !== 'active') return 0;

  const now = new Date();
  const expiresAt = new Date(subscription.expiresAt);
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Verifica se assinatura está próxima de expirar (menos de 7 dias)
 */
export function isSubscriptionExpiringSoon(userId: string): boolean {
  const daysRemaining = getDaysRemaining(userId);
  return daysRemaining > 0 && daysRemaining <= 7;
}

/**
 * Obtém informações completas do plano premium
 */
export function getPremiumInfo(userId: string) {
  const isPremium = isPremiumUser(userId);
  const subscription = getUserSubscription(userId);
  const daysRemaining = getDaysRemaining(userId);
  const expiringSoon = isSubscriptionExpiringSoon(userId);

  return {
    isPremium,
    subscription,
    daysRemaining,
    expiringSoon,
    features: PREMIUM_FEATURES,
    dailyLimit: getDailyPredictionLimit(userId),
  };
}

/**
 * Simula processamento de pagamento
 * Em produção, isso integraria com gateway de pagamento real
 */
export async function processPremiumPayment(
  userId: string,
  plan: 'monthly' | 'yearly',
  paymentMethod: string
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    // Simular delay de processamento
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simular sucesso (90% de chance)
    const success = Math.random() > 0.1;

    if (!success) {
      return {
        success: false,
        error: 'Falha no processamento do pagamento. Tente novamente.',
      };
    }

    // Criar assinatura
    const subscription = createSubscription(userId, plan);

    return {
      success: true,
      subscriptionId: `sub_${Date.now()}`,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao processar pagamento',
    };
  }
}

/**
 * Obtém preços dos planos
 */
export function getPlanPrices() {
  return {
    monthly: {
      price: 29.90,
      currency: 'BRL',
      period: 'mês',
    },
    yearly: {
      price: 299.90,
      currency: 'BRL',
      period: 'ano',
      discount: '17% de desconto',
      monthlyEquivalent: 24.99,
    },
  };
}
