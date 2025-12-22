// ============================================
// HANDLER DE NOTIFICAÇÕES AUTOMÁTICAS
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type NotificationType =
  | 'daily_predictions'
  | 'advantageous_odds'
  | 'renewal_reminder'
  | 'subscription_renewed'
  | 'subscription_expired'
  | 'payment_failed'
  | 'performance_report'
  | 'platform_update';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Cria notificação no banco de dados
 */
export async function createNotification(data: NotificationData): Promise<void> {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: data.userId,
      titulo: data.title,
      mensagem: data.message,
      lida: false,
      data: new Date().toISOString(),
      metadata: data.metadata || {},
    });

    if (error) throw error;

    console.log(`✅ Notificação criada: ${data.title} para usuário ${data.userId}`);

    // Enviar push notification (se habilitado)
    await sendPushNotification(data);
  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
  }
}

/**
 * Envia push notification (Web Push API)
 */
async function sendPushNotification(data: NotificationData): Promise<void> {
  // Verificar se usuário tem push habilitado
  const pushEnabled = await isPushNotificationEnabled(data.userId);
  if (!pushEnabled) return;

  try {
    // Em produção, integraria com serviço de push (Firebase, OneSignal, etc)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.title, {
        body: data.message,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: data.type,
      });
    }

    console.log(`📱 Push notification enviado: ${data.title}`);
  } catch (error) {
    console.error('❌ Erro ao enviar push notification:', error);
  }
}

/**
 * Verifica se usuário tem push notifications habilitado
 */
async function isPushNotificationEnabled(userId: string): Promise<boolean> {
  const settings = localStorage.getItem(`push_settings_${userId}`);
  if (!settings) return true; // Habilitado por padrão

  try {
    const parsed = JSON.parse(settings);
    return parsed.enabled !== false;
  } catch {
    return true;
  }
}

/**
 * Marca notificação como lida
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await supabase
      .from('notifications')
      .update({ lida: true })
      .eq('id', notificationId);

    console.log(`✅ Notificação marcada como lida: ${notificationId}`);
  } catch (error) {
    console.error('❌ Erro ao marcar notificação como lida:', error);
  }
}

/**
 * Busca notificações não lidas de um usuário
 */
export async function getUnreadNotifications(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('lida', false)
      .order('data', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar notificações:', error);
    return [];
  }
}

/**
 * Busca todas as notificações de um usuário
 */
export async function getAllNotifications(userId: string, limit = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar notificações:', error);
    return [];
  }
}

/**
 * Deleta notificação
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    await supabase.from('notifications').delete().eq('id', notificationId);

    console.log(`✅ Notificação deletada: ${notificationId}`);
  } catch (error) {
    console.error('❌ Erro ao deletar notificação:', error);
  }
}

/**
 * Deleta todas as notificações lidas de um usuário
 */
export async function deleteReadNotifications(userId: string): Promise<void> {
  try {
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('lida', true);

    console.log(`✅ Notificações lidas deletadas para usuário ${userId}`);
  } catch (error) {
    console.error('❌ Erro ao deletar notificações lidas:', error);
  }
}

/**
 * Conta notificações não lidas
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('lida', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('❌ Erro ao contar notificações:', error);
    return 0;
  }
}

// ============================================
// TEMPLATES DE NOTIFICAÇÕES
// ============================================

export const notificationTemplates = {
  dailyPredictions: (count: number) => ({
    title: '🎯 Seus Palpites do Dia Chegaram!',
    message: `${count} palpites personalizados foram gerados para você. Confira agora!`,
  }),

  advantageousOdds: (match: string, platform: string, odds: number) => ({
    title: '💎 Odds Vantajosas Detectadas!',
    message: `${match} - ${platform} está pagando ${odds.toFixed(2)} neste momento!`,
  }),

  renewalReminder: (daysRemaining: number) => ({
    title: '⏰ Lembrete de Renovação',
    message: `Sua assinatura Premium expira em ${daysRemaining} dia${daysRemaining > 1 ? 's' : ''}. Renove agora!`,
  }),

  subscriptionRenewed: () => ({
    title: '✅ Assinatura Renovada',
    message: 'Sua assinatura Premium foi renovada com sucesso! Continue aproveitando todos os benefícios.',
  }),

  subscriptionExpired: () => ({
    title: '⏰ Assinatura Expirada',
    message: 'Sua assinatura Premium expirou. Renove agora para continuar aproveitando todos os recursos!',
  }),

  paymentFailed: () => ({
    title: '❌ Falha no Pagamento',
    message: 'Houve um problema com seu pagamento. Atualize seus dados para continuar com o Premium.',
  }),

  performanceReport: (wins: number, total: number, winRate: string) => ({
    title: '📊 Seu Relatório Semanal',
    message: `Você teve ${wins} acertos em ${total} apostas (${winRate}% de aproveitamento). Continue assim!`,
  }),

  platformUpdate: (platformName: string) => ({
    title: '🔄 Plataforma Atualizada',
    message: `${platformName} teve suas odds atualizadas. Confira as novas oportunidades!`,
  }),
};

/**
 * Envia notificação usando template
 */
export async function sendTemplatedNotification(
  userId: string,
  type: NotificationType,
  templateData: any
): Promise<void> {
  let notification;

  switch (type) {
    case 'daily_predictions':
      notification = notificationTemplates.dailyPredictions(templateData.count);
      break;
    case 'advantageous_odds':
      notification = notificationTemplates.advantageousOdds(
        templateData.match,
        templateData.platform,
        templateData.odds
      );
      break;
    case 'renewal_reminder':
      notification = notificationTemplates.renewalReminder(templateData.daysRemaining);
      break;
    case 'subscription_renewed':
      notification = notificationTemplates.subscriptionRenewed();
      break;
    case 'subscription_expired':
      notification = notificationTemplates.subscriptionExpired();
      break;
    case 'payment_failed':
      notification = notificationTemplates.paymentFailed();
      break;
    case 'performance_report':
      notification = notificationTemplates.performanceReport(
        templateData.wins,
        templateData.total,
        templateData.winRate
      );
      break;
    case 'platform_update':
      notification = notificationTemplates.platformUpdate(templateData.platformName);
      break;
    default:
      return;
  }

  await createNotification({
    userId,
    type,
    title: notification.title,
    message: notification.message,
    metadata: templateData,
  });
}
