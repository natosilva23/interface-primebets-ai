// ============================================
// AUTOMAÇÃO: LEMBRETES DE RENOVAÇÃO
// ============================================

import { getDaysRemaining, getUserSubscription } from '../services/premium';
import { createNotification } from '../services/notifications';

/**
 * Agenda lembretes de renovação (diariamente às 10h)
 */
export function scheduleRenewalReminders(userId: string): void {
  // Calcular próximo horário (10h)
  const now = new Date();
  const next10AM = new Date();
  next10AM.setHours(10, 0, 0, 0);

  // Se já passou das 10h hoje, agendar para amanhã
  if (now > next10AM) {
    next10AM.setDate(next10AM.getDate() + 1);
  }

  const msUntilNext = next10AM.getTime() - now.getTime();

  // Agendar primeira execução
  setTimeout(() => {
    checkRenewalReminders(userId);

    // Repetir a cada 24 horas
    setInterval(() => {
      checkRenewalReminders(userId);
    }, 24 * 60 * 60 * 1000);
  }, msUntilNext);

  console.log(`🔔 Lembretes de renovação agendados para ${next10AM.toLocaleString()}`);
}

/**
 * Verifica se deve enviar lembrete de renovação
 */
async function checkRenewalReminders(userId: string): Promise<void> {
  try {
    const subscription = getUserSubscription(userId);

    if (!subscription || subscription.status !== 'active') return;

    const daysRemaining = getDaysRemaining(userId);

    // Enviar lembretes em momentos estratégicos
    if (daysRemaining === 7) {
      sendRenewalReminder(userId, 7, 'warning');
    } else if (daysRemaining === 3) {
      sendRenewalReminder(userId, 3, 'urgent');
    } else if (daysRemaining === 1) {
      sendRenewalReminder(userId, 1, 'critical');
    } else if (daysRemaining === 0) {
      sendExpirationNotice(userId);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar lembretes de renovação:', error);
  }
}

/**
 * Envia lembrete de renovação
 */
function sendRenewalReminder(
  userId: string,
  daysRemaining: number,
  urgency: 'warning' | 'urgent' | 'critical'
): void {
  const messages = {
    warning: {
      title: '⏰ Sua Assinatura Expira em 7 Dias',
      message:
        'Sua assinatura Premium expira em 7 dias. Renove agora e continue aproveitando todos os benefícios!',
    },
    urgent: {
      title: '⚠️ Sua Assinatura Expira em 3 Dias',
      message:
        'Atenção! Sua assinatura Premium expira em 3 dias. Não perca acesso aos recursos exclusivos!',
    },
    critical: {
      title: '🚨 Sua Assinatura Expira Amanhã!',
      message:
        'URGENTE: Sua assinatura Premium expira amanhã! Renove agora para não perder acesso.',
    },
  };

  const { title, message } = messages[urgency];

  createNotification(userId, 'renewal', title, message, {
    daysRemaining,
    urgency,
    action: 'renew',
  });

  console.log(`🔔 Lembrete de renovação enviado: ${daysRemaining} dias restantes`);
}

/**
 * Envia aviso de expiração
 */
function sendExpirationNotice(userId: string): void {
  createNotification(
    userId,
    'renewal',
    '⏰ Sua Assinatura Expira Hoje!',
    'Sua assinatura Premium expira hoje! Renove agora para continuar com acesso ilimitado.',
    {
      daysRemaining: 0,
      urgency: 'expired',
      action: 'renew_now',
    }
  );

  console.log('⏰ Aviso de expiração enviado');
}

/**
 * Envia lembrete de pagamento pendente
 */
export function sendPaymentPendingReminder(userId: string): void {
  createNotification(
    userId,
    'renewal',
    '💳 Pagamento Pendente',
    'Há um pagamento pendente em sua conta. Complete o pagamento para manter seu Premium ativo.',
    {
      action: 'complete_payment',
    }
  );

  console.log('💳 Lembrete de pagamento pendente enviado');
}

/**
 * Envia confirmação de renovação bem-sucedida
 */
export function sendRenewalConfirmation(userId: string, plan: string): void {
  const subscription = getUserSubscription(userId);
  if (!subscription) return;

  const expiresAt = new Date(subscription.expiresAt);

  createNotification(
    userId,
    'update',
    '✅ Renovação Confirmada!',
    `Sua assinatura Premium (${plan}) foi renovada com sucesso! Válida até ${expiresAt.toLocaleDateString()}.`,
    {
      plan,
      expiresAt: expiresAt.toISOString(),
    }
  );

  console.log(`✅ Confirmação de renovação enviada: ${plan}`);
}

/**
 * Envia lembrete de cancelamento agendado
 */
export function sendCancellationReminder(userId: string): void {
  const subscription = getUserSubscription(userId);
  if (!subscription) return;

  const daysRemaining = getDaysRemaining(userId);

  createNotification(
    userId,
    'update',
    'ℹ️ Cancelamento Agendado',
    `Sua assinatura foi cancelada e expirará em ${daysRemaining} dias. Você pode reativar a qualquer momento!`,
    {
      daysRemaining,
      action: 'reactivate',
    }
  );

  console.log('ℹ️ Lembrete de cancelamento agendado enviado');
}

/**
 * Agenda lembrete personalizado
 */
export function scheduleCustomReminder(
  userId: string,
  title: string,
  message: string,
  delayMs: number
): void {
  setTimeout(() => {
    createNotification(userId, 'update', title, message);
    console.log(`📬 Lembrete personalizado enviado: ${title}`);
  }, delayMs);
}

/**
 * Obtém próximos lembretes agendados
 */
export function getUpcomingReminders(userId: string): Array<{
  type: string;
  daysUntil: number;
  message: string;
}> {
  const daysRemaining = getDaysRemaining(userId);
  const reminders: Array<{ type: string; daysUntil: number; message: string }> = [];

  if (daysRemaining > 7) {
    reminders.push({
      type: 'warning',
      daysUntil: daysRemaining - 7,
      message: 'Lembrete de renovação (7 dias)',
    });
  }

  if (daysRemaining > 3) {
    reminders.push({
      type: 'urgent',
      daysUntil: daysRemaining - 3,
      message: 'Lembrete urgente (3 dias)',
    });
  }

  if (daysRemaining > 1) {
    reminders.push({
      type: 'critical',
      daysUntil: daysRemaining - 1,
      message: 'Lembrete crítico (1 dia)',
    });
  }

  if (daysRemaining > 0) {
    reminders.push({
      type: 'expiration',
      daysUntil: daysRemaining,
      message: 'Expiração da assinatura',
    });
  }

  return reminders;
}
