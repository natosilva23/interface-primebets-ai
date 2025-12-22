// ============================================
// AUTOMAÇÃO: VERIFICAÇÃO DE STATUS PREMIUM
// ============================================

import {
  isPremiumUser,
  getUserSubscription,
  getDaysRemaining,
  cancelSubscription,
  renewSubscription,
} from '../services/premium';
import { createNotification } from '../services/notifications';

/**
 * Agenda verificações de status premium (a cada 1 hora)
 */
export function schedulePremiumChecks(userId: string): void {
  // Executar imediatamente
  checkPremiumStatus(userId);

  // Repetir a cada 1 hora
  setInterval(() => {
    checkPremiumStatus(userId);
  }, 60 * 60 * 1000);

  console.log('🔐 Verificação de status premium agendada (a cada 1 hora)');
}

/**
 * Verifica status da assinatura premium
 */
async function checkPremiumStatus(userId: string): Promise<void> {
  try {
    const subscription = getUserSubscription(userId);

    if (!subscription) return;

    // Verificar se expirou
    if (subscription.status === 'active') {
      const now = new Date();
      const expiresAt = new Date(subscription.expiresAt);

      if (now > expiresAt) {
        // Assinatura expirou
        await handleExpiredSubscription(userId);
      }
    }

    // Verificar se pagamento falhou
    if (subscription.status === 'payment_failed') {
      await handleFailedPayment(userId);
    }

    // Verificar se foi cancelada
    if (subscription.status === 'cancelled') {
      await handleCancelledSubscription(userId);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar status premium:', error);
  }
}

/**
 * Trata assinatura expirada
 */
async function handleExpiredSubscription(userId: string): Promise<void> {
  const subscription = getUserSubscription(userId);
  if (!subscription) return;

  // Se auto-renovação está ativa, tentar renovar
  if (subscription.autoRenew) {
    const renewed = await attemptAutoRenewal(userId);

    if (renewed) {
      createNotification(
        userId,
        'renewal',
        '✅ Assinatura Renovada Automaticamente',
        'Sua assinatura Premium foi renovada com sucesso! Continue aproveitando todos os benefícios.'
      );
      console.log(`✅ Assinatura renovada automaticamente: ${userId}`);
    } else {
      // Falha na renovação automática
      await blockPremiumAccess(userId);
      createNotification(
        userId,
        'renewal',
        '⚠️ Falha na Renovação Automática',
        'Não foi possível renovar sua assinatura. Atualize seus dados de pagamento para continuar.'
      );
      console.log(`❌ Falha na renovação automática: ${userId}`);
    }
  } else {
    // Sem auto-renovação, bloquear acesso
    await blockPremiumAccess(userId);
    createNotification(
      userId,
      'renewal',
      '⏰ Assinatura Expirada',
      'Sua assinatura Premium expirou. Renove agora para continuar aproveitando todos os recursos!'
    );
    console.log(`⏰ Assinatura expirada: ${userId}`);
  }
}

/**
 * Trata falha de pagamento
 */
async function handleFailedPayment(userId: string): Promise<void> {
  await blockPremiumAccess(userId);

  createNotification(
    userId,
    'renewal',
    '❌ Falha no Pagamento',
    'Houve um problema com seu pagamento. Atualize seus dados para continuar com o Premium.'
  );

  console.log(`❌ Falha de pagamento detectada: ${userId}`);
}

/**
 * Trata assinatura cancelada
 */
async function handleCancelledSubscription(userId: string): Promise<void> {
  const subscription = getUserSubscription(userId);
  if (!subscription) return;

  // Verificar se ainda está no período pago
  const now = new Date();
  const expiresAt = new Date(subscription.expiresAt);

  if (now > expiresAt) {
    // Período acabou, bloquear acesso
    await blockPremiumAccess(userId);

    createNotification(
      userId,
      'update',
      'ℹ️ Assinatura Encerrada',
      'Sua assinatura Premium foi encerrada. Você pode reativar a qualquer momento!'
    );

    console.log(`ℹ️ Assinatura cancelada e período expirado: ${userId}`);
  }
}

/**
 * Tenta renovar assinatura automaticamente
 */
async function attemptAutoRenewal(userId: string): Promise<boolean> {
  try {
    // Simular tentativa de cobrança (em produção, integraria com gateway)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simular sucesso (80% de chance)
    const success = Math.random() > 0.2;

    if (success) {
      renewSubscription(userId);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao tentar renovação automática:', error);
    return false;
  }
}

/**
 * Bloqueia acesso aos recursos premium
 */
async function blockPremiumAccess(userId: string): Promise<void> {
  const subscription = getUserSubscription(userId);
  if (!subscription) return;

  // Atualizar status para bloqueado
  subscription.status = 'expired';
  localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));

  console.log(`🔒 Acesso premium bloqueado: ${userId}`);
}

/**
 * Libera acesso aos recursos premium
 */
export async function unlockPremiumAccess(userId: string): Promise<void> {
  const subscription = getUserSubscription(userId);
  if (!subscription) return;

  // Atualizar status para ativo
  subscription.status = 'active';
  localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));

  createNotification(
    userId,
    'update',
    '🎉 Premium Ativado!',
    'Bem-vindo de volta ao PrimeBets Premium! Todos os recursos foram liberados.'
  );

  console.log(`🔓 Acesso premium liberado: ${userId}`);
}

/**
 * Verifica se usuário tem acesso a recurso específico
 */
export function checkFeatureAccess(userId: string, feature: string): boolean {
  const premiumFeatures = [
    'platform_comparison',
    'unlimited_predictions',
    'advanced_analytics',
    'priority_support',
  ];

  if (!premiumFeatures.includes(feature)) {
    return true; // Feature gratuita
  }

  return isPremiumUser(userId);
}

/**
 * Obtém status detalhado da assinatura
 */
export function getSubscriptionStatus(userId: string) {
  const subscription = getUserSubscription(userId);
  const isPremium = isPremiumUser(userId);
  const daysRemaining = getDaysRemaining(userId);

  return {
    isPremium,
    subscription,
    daysRemaining,
    hasAccess: isPremium,
    needsRenewal: daysRemaining <= 7 && daysRemaining > 0,
    isExpired: subscription?.status === 'expired',
    isBlocked: subscription?.status === 'payment_failed',
  };
}
