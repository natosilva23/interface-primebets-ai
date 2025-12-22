// ============================================
// SERVIÇO: SISTEMA DE PAGAMENTOS
// ============================================

export type PaymentMethod = 'pix' | 'credit_card' | 'stripe' | 'mercadopago' | 'asaas';
export type PaymentStatus = 'pending' | 'processing' | 'approved' | 'failed' | 'cancelled';
export type SubscriptionPlan = 'monthly' | 'quarterly' | 'yearly';

export interface PaymentTransaction {
  id: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  plan: SubscriptionPlan;
  createdAt: Date;
  approvedAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  externalId?: string; // ID do gateway externo
}

export interface SubscriptionData {
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  expiresAt: Date;
  autoRenew: boolean;
  paymentMethod: PaymentMethod;
  lastPaymentId?: string;
}

// Preços dos planos
export const PLAN_PRICES = {
  monthly: {
    price: 29.90,
    period: 'mês',
    months: 1,
    discount: 0
  },
  quarterly: {
    price: 74.90,
    period: '3 meses',
    months: 3,
    discount: 17,
    monthlyEquivalent: 24.97
  },
  yearly: {
    price: 239.90,
    period: 'ano',
    months: 12,
    discount: 33,
    monthlyEquivalent: 19.99
  }
};

/**
 * Cria uma nova transação de pagamento
 */
export function createPaymentTransaction(
  userId: string,
  plan: SubscriptionPlan,
  method: PaymentMethod
): PaymentTransaction {
  const transaction: PaymentTransaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    amount: PLAN_PRICES[plan].price,
    method,
    status: 'pending',
    plan,
    createdAt: new Date()
  };

  // Salvar transação
  saveTransaction(transaction);

  return transaction;
}

/**
 * Processa pagamento via PIX
 */
export async function processPixPayment(
  transaction: PaymentTransaction
): Promise<{ success: boolean; qrCode?: string; error?: string }> {
  try {
    // Atualizar status
    transaction.status = 'processing';
    saveTransaction(transaction);

    // Simular geração de QR Code PIX
    await new Promise(resolve => setTimeout(resolve, 1000));

    const qrCode = `00020126580014br.gov.bcb.pix0136${transaction.id}520400005303986540${transaction.amount.toFixed(2)}5802BR5925PRIMEBETS AI6009SAO PAULO62070503***6304`;

    return {
      success: true,
      qrCode
    };
  } catch (error) {
    transaction.status = 'failed';
    transaction.failedAt = new Date();
    transaction.errorMessage = 'Erro ao gerar QR Code PIX';
    saveTransaction(transaction);

    return {
      success: false,
      error: 'Erro ao processar pagamento PIX'
    };
  }
}

/**
 * Processa pagamento via Cartão de Crédito
 */
export async function processCreditCardPayment(
  transaction: PaymentTransaction,
  cardData: {
    number: string;
    holderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    transaction.status = 'processing';
    saveTransaction(transaction);

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular aprovação (90% de sucesso)
    const isApproved = Math.random() > 0.1;

    if (isApproved) {
      transaction.status = 'approved';
      transaction.approvedAt = new Date();
      transaction.externalId = `card_${Date.now()}`;
      saveTransaction(transaction);

      // Ativar assinatura
      await activateSubscription(transaction);

      return { success: true };
    } else {
      transaction.status = 'failed';
      transaction.failedAt = new Date();
      transaction.errorMessage = 'Cartão recusado';
      saveTransaction(transaction);

      // Bloquear acesso e notificar
      blockPremiumAccess(transaction.userId, 'Pagamento recusado pelo banco');

      return {
        success: false,
        error: 'Pagamento recusado. Verifique os dados do cartão.'
      };
    }
  } catch (error) {
    transaction.status = 'failed';
    transaction.failedAt = new Date();
    transaction.errorMessage = 'Erro no processamento';
    saveTransaction(transaction);

    blockPremiumAccess(transaction.userId, 'Erro no processamento do pagamento');

    return {
      success: false,
      error: 'Erro ao processar pagamento'
    };
  }
}

/**
 * Processa pagamento via Stripe
 */
export async function processStripePayment(
  transaction: PaymentTransaction,
  stripeToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    transaction.status = 'processing';
    saveTransaction(transaction);

    // Em produção, integrar com Stripe API
    await new Promise(resolve => setTimeout(resolve, 1500));

    const isApproved = Math.random() > 0.05;

    if (isApproved) {
      transaction.status = 'approved';
      transaction.approvedAt = new Date();
      transaction.externalId = `stripe_${stripeToken}`;
      saveTransaction(transaction);

      await activateSubscription(transaction);

      return { success: true };
    } else {
      transaction.status = 'failed';
      transaction.failedAt = new Date();
      transaction.errorMessage = 'Stripe payment failed';
      saveTransaction(transaction);

      blockPremiumAccess(transaction.userId, 'Pagamento não autorizado pelo Stripe');

      return {
        success: false,
        error: 'Pagamento não autorizado'
      };
    }
  } catch (error) {
    transaction.status = 'failed';
    transaction.failedAt = new Date();
    saveTransaction(transaction);

    blockPremiumAccess(transaction.userId, 'Erro ao processar com Stripe');

    return {
      success: false,
      error: 'Erro ao processar com Stripe'
    };
  }
}

/**
 * Processa pagamento via Mercado Pago
 */
export async function processMercadoPagoPayment(
  transaction: PaymentTransaction,
  paymentData: any
): Promise<{ success: boolean; error?: string }> {
  try {
    transaction.status = 'processing';
    saveTransaction(transaction);

    // Em produção, integrar com Mercado Pago API
    await new Promise(resolve => setTimeout(resolve, 1500));

    const isApproved = Math.random() > 0.08;

    if (isApproved) {
      transaction.status = 'approved';
      transaction.approvedAt = new Date();
      transaction.externalId = `mp_${Date.now()}`;
      saveTransaction(transaction);

      await activateSubscription(transaction);

      return { success: true };
    } else {
      transaction.status = 'failed';
      transaction.failedAt = new Date();
      transaction.errorMessage = 'Mercado Pago payment failed';
      saveTransaction(transaction);

      blockPremiumAccess(transaction.userId, 'Pagamento não aprovado pelo Mercado Pago');

      return {
        success: false,
        error: 'Pagamento não aprovado'
      };
    }
  } catch (error) {
    transaction.status = 'failed';
    transaction.failedAt = new Date();
    saveTransaction(transaction);

    blockPremiumAccess(transaction.userId, 'Erro ao processar com Mercado Pago');

    return {
      success: false,
      error: 'Erro ao processar com Mercado Pago'
    };
  }
}

/**
 * Processa pagamento via ASAAS
 */
export async function processAsaasPayment(
  transaction: PaymentTransaction,
  paymentData: any
): Promise<{ success: boolean; error?: string }> {
  try {
    transaction.status = 'processing';
    saveTransaction(transaction);

    // Em produção, integrar com ASAAS API
    await new Promise(resolve => setTimeout(resolve, 1500));

    const isApproved = Math.random() > 0.07;

    if (isApproved) {
      transaction.status = 'approved';
      transaction.approvedAt = new Date();
      transaction.externalId = `asaas_${Date.now()}`;
      saveTransaction(transaction);

      await activateSubscription(transaction);

      return { success: true };
    } else {
      transaction.status = 'failed';
      transaction.failedAt = new Date();
      transaction.errorMessage = 'ASAAS payment failed';
      saveTransaction(transaction);

      blockPremiumAccess(transaction.userId, 'Pagamento não aprovado pelo ASAAS');

      return {
        success: false,
        error: 'Pagamento não aprovado'
      };
    }
  } catch (error) {
    transaction.status = 'failed';
    transaction.failedAt = new Date();
    saveTransaction(transaction);

    blockPremiumAccess(transaction.userId, 'Erro ao processar com ASAAS');

    return {
      success: false,
      error: 'Erro ao processar com ASAAS'
    };
  }
}

/**
 * Confirma pagamento PIX (webhook simulation)
 */
export async function confirmPixPayment(
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transaction = getTransaction(transactionId);

    if (!transaction) {
      return { success: false, error: 'Transação não encontrada' };
    }

    if (transaction.status !== 'processing') {
      return { success: false, error: 'Status inválido' };
    }

    transaction.status = 'approved';
    transaction.approvedAt = new Date();
    transaction.externalId = `pix_${Date.now()}`;
    saveTransaction(transaction);

    await activateSubscription(transaction);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao confirmar pagamento'
    };
  }
}

/**
 * Ativa assinatura após pagamento aprovado
 */
async function activateSubscription(transaction: PaymentTransaction): Promise<void> {
  const planConfig = PLAN_PRICES[transaction.plan];
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + planConfig.months);

  const subscription: SubscriptionData = {
    userId: transaction.userId,
    plan: transaction.plan,
    status: 'active',
    startDate: now,
    expiresAt,
    autoRenew: true,
    paymentMethod: transaction.method,
    lastPaymentId: transaction.id
  };

  // Salvar assinatura
  localStorage.setItem(`subscription_${transaction.userId}`, JSON.stringify(subscription));
  localStorage.setItem('isPremium', 'true');

  // Criar log na tabela premium_subscriptions
  await logSubscription(subscription, transaction);

  // Notificar usuário
  notifySubscriptionActivated(transaction.userId, transaction.plan);
}

/**
 * Cancela assinatura
 */
export async function cancelSubscription(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const subscriptionData = localStorage.getItem(`subscription_${userId}`);
    
    if (!subscriptionData) {
      return { success: false, error: 'Assinatura não encontrada' };
    }

    const subscription: SubscriptionData = JSON.parse(subscriptionData);
    subscription.status = 'cancelled';
    subscription.autoRenew = false;

    localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
    
    // Manter acesso até expiração
    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    
    if (expiresAt > now) {
      // Ainda tem acesso até expirar
      localStorage.setItem('isPremium', 'true');
    } else {
      localStorage.setItem('isPremium', 'false');
    }

    // Notificar usuário
    notifySubscriptionCancelled(userId);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao cancelar assinatura'
    };
  }
}

/**
 * Bloqueia acesso Premium em caso de falha
 */
export function blockPremiumAccess(userId: string, reason: string): void {
  const subscriptionData = localStorage.getItem(`subscription_${userId}`);
  
  if (subscriptionData) {
    const subscription: SubscriptionData = JSON.parse(subscriptionData);
    subscription.status = 'expired';
    subscription.autoRenew = false;
    localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
  }

  localStorage.setItem('isPremium', 'false');

  // Notificar usuário
  notifyPaymentFailed(userId, reason);
}

/**
 * Verifica status da assinatura
 */
export function getSubscriptionStatus(userId: string): SubscriptionData | null {
  const data = localStorage.getItem(`subscription_${userId}`);
  
  if (!data) return null;

  try {
    const subscription: SubscriptionData = JSON.parse(data);
    
    // Verificar se expirou
    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    
    if (expiresAt < now && subscription.status === 'active') {
      subscription.status = 'expired';
      localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
      localStorage.setItem('isPremium', 'false');
      
      // Notificar expiração
      notifySubscriptionExpired(userId);
    }

    return subscription;
  } catch {
    return null;
  }
}

/**
 * Processa renovação automática
 */
export async function processAutoRenewal(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const subscription = getSubscriptionStatus(userId);
    
    if (!subscription || !subscription.autoRenew) {
      return { success: false, error: 'Renovação automática desativada' };
    }

    // Criar nova transação
    const transaction = createPaymentTransaction(
      userId,
      subscription.plan,
      subscription.paymentMethod
    );

    // Simular processamento de renovação
    await new Promise(resolve => setTimeout(resolve, 2000));

    const isApproved = Math.random() > 0.1;

    if (isApproved) {
      transaction.status = 'approved';
      transaction.approvedAt = new Date();
      saveTransaction(transaction);

      // Estender assinatura
      const planConfig = PLAN_PRICES[subscription.plan];
      const newExpiresAt = new Date(subscription.expiresAt);
      newExpiresAt.setMonth(newExpiresAt.getMonth() + planConfig.months);

      subscription.expiresAt = newExpiresAt;
      subscription.status = 'active';
      subscription.lastPaymentId = transaction.id;

      localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
      localStorage.setItem('isPremium', 'true');

      await logSubscription(subscription, transaction);
      notifyRenewalSuccess(userId);

      return { success: true };
    } else {
      transaction.status = 'failed';
      transaction.failedAt = new Date();
      saveTransaction(transaction);

      blockPremiumAccess(userId, 'Falha na renovação automática');
      notifyRenewalFailed(userId);

      return {
        success: false,
        error: 'Falha na renovação automática'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao processar renovação'
    };
  }
}

/**
 * Salva transação no localStorage
 */
function saveTransaction(transaction: PaymentTransaction): void {
  const transactions = getAllTransactions();
  const index = transactions.findIndex(t => t.id === transaction.id);
  
  if (index >= 0) {
    transactions[index] = transaction;
  } else {
    transactions.push(transaction);
  }

  localStorage.setItem('payment_transactions', JSON.stringify(transactions));
}

/**
 * Obtém transação por ID
 */
function getTransaction(transactionId: string): PaymentTransaction | null {
  const transactions = getAllTransactions();
  return transactions.find(t => t.id === transactionId) || null;
}

/**
 * Obtém todas as transações
 */
function getAllTransactions(): PaymentTransaction[] {
  const data = localStorage.getItem('payment_transactions');
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Obtém transações do usuário
 */
export function getUserTransactions(userId: string): PaymentTransaction[] {
  return getAllTransactions().filter(t => t.userId === userId);
}

/**
 * Cria log na tabela premium_subscriptions (simulado)
 */
async function logSubscription(
  subscription: SubscriptionData,
  transaction: PaymentTransaction
): Promise<void> {
  const log = {
    id: `log_${Date.now()}`,
    userId: subscription.userId,
    plan: subscription.plan,
    status: subscription.status,
    amount: transaction.amount,
    paymentMethod: transaction.method,
    transactionId: transaction.id,
    startDate: subscription.startDate,
    expiresAt: subscription.expiresAt,
    createdAt: new Date()
  };

  const logs = JSON.parse(localStorage.getItem('premium_subscriptions') || '[]');
  logs.push(log);
  localStorage.setItem('premium_subscriptions', JSON.stringify(logs));
}

/**
 * Notificações
 */
function notifySubscriptionActivated(userId: string, plan: SubscriptionPlan): void {
  console.log(`✅ Assinatura ${plan} ativada para usuário ${userId}`);
  // Em produção: enviar email, push notification, etc.
}

function notifySubscriptionCancelled(userId: string): void {
  console.log(`❌ Assinatura cancelada para usuário ${userId}`);
  // Em produção: enviar email de confirmação
}

function notifyPaymentFailed(userId: string, reason: string): void {
  console.log(`⚠️ Falha no pagamento para usuário ${userId}: ${reason}`);
  // Em produção: enviar email/notificação sobre falha
}

function notifySubscriptionExpired(userId: string): void {
  console.log(`⏰ Assinatura expirada para usuário ${userId}`);
  // Em produção: enviar email sobre expiração
}

function notifyRenewalSuccess(userId: string): void {
  console.log(`🔄 Renovação automática bem-sucedida para usuário ${userId}`);
  // Em produção: enviar confirmação de renovação
}

function notifyRenewalFailed(userId: string): void {
  console.log(`❌ Falha na renovação automática para usuário ${userId}`);
  // Em produção: enviar alerta de falha na renovação
}
