// ============================================
// SERVIÇO: SISTEMA DE NOTIFICAÇÕES
// ============================================

import { isPremiumUser } from './premium';

// Tipo local para notificações do sistema
interface SystemNotification {
  id: string;
  userId: string;
  type: 'newPrediction' | 'advantageousOdds' | 'renewal' | 'update';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}

/**
 * Cria nova notificação para o usuário
 */
export function createNotification(
  userId: string,
  type: SystemNotification['type'],
  title: string,
  message: string,
  data?: Record<string, any>
): SystemNotification {
  const notification: SystemNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    title,
    message,
    read: false,
    createdAt: new Date(),
    data,
  };

  // Salvar notificação
  saveNotification(notification);

  // Enviar push notification (se suportado)
  sendPushNotification(notification);

  return notification;
}

/**
 * Salva notificação no storage
 */
function saveNotification(notification: SystemNotification): void {
  const notifications = getUserNotifications(notification.userId);
  notifications.unshift(notification);

  // Manter apenas últimas 50 notificações
  if (notifications.length > 50) {
    notifications.pop();
  }

  localStorage.setItem(
    `notifications_${notification.userId}`,
    JSON.stringify(notifications)
  );
}

/**
 * Obtém todas as notificações do usuário
 */
export function getUserNotifications(userId: string): SystemNotification[] {
  const data = localStorage.getItem(`notifications_${userId}`);
  if (!data) return [];

  try {
    const notifications = JSON.parse(data);
    return notifications.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Obtém notificações não lidas
 */
export function getUnreadNotifications(userId: string): SystemNotification[] {
  return getUserNotifications(userId).filter((n) => !n.read);
}

/**
 * Marca notificação como lida
 */
export function markAsRead(userId: string, notificationId: string): void {
  const notifications = getUserNotifications(userId);
  const notification = notifications.find((n) => n.id === notificationId);

  if (notification) {
    notification.read = true;
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  }
}

/**
 * Marca todas as notificações como lidas
 */
export function markAllAsRead(userId: string): void {
  const notifications = getUserNotifications(userId);
  notifications.forEach((n) => (n.read = true));
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
}

/**
 * Deleta notificação
 */
export function deleteNotification(userId: string, notificationId: string): void {
  let notifications = getUserNotifications(userId);
  notifications = notifications.filter((n) => n.id !== notificationId);
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
}

/**
 * Deleta todas as notificações
 */
export function deleteAllNotifications(userId: string): void {
  localStorage.removeItem(`notifications_${userId}`);
}

/**
 * Envia notificação de novos palpites
 */
export function notifyNewPredictions(userId: string, count: number): void {
  createNotification(
    userId,
    'newPrediction',
    '🎯 Novos Palpites Disponíveis',
    `${count} novos palpites foram gerados baseados no seu perfil!`,
    { count }
  );
}

/**
 * Envia notificação de odds vantajosas
 */
export function notifyAdvantageousOdds(
  userId: string,
  match: string,
  odds: number
): void {
  // Apenas usuários premium recebem notificações de odds
  if (!isPremiumUser(userId)) return;

  createNotification(
    userId,
    'advantageousOdds',
    '💎 Odds Vantajosas Detectadas',
    `${match} - Odds de ${odds} identificadas como oportunidade!`,
    { match, odds }
  );
}

/**
 * Envia notificação de renovação de assinatura
 */
export function notifySubscriptionRenewal(
  userId: string,
  daysRemaining: number
): void {
  const message =
    daysRemaining === 0
      ? 'Sua assinatura Premium expira hoje! Renove para continuar aproveitando todos os benefícios.'
      : `Sua assinatura Premium expira em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}. Renove agora!`;

  createNotification(
    userId,
    'renewal',
    '⚠️ Renovação de Assinatura',
    message,
    { daysRemaining }
  );
}

/**
 * Envia notificação de atualização importante
 */
export function notifyUpdate(userId: string, title: string, message: string): void {
  createNotification(userId, 'update', title, message);
}

/**
 * Envia push notification (Web Push API)
 */
async function sendPushNotification(notification: SystemNotification): Promise<void> {
  // Verificar se Push API está disponível
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  // Verificar permissão
  if (Notification.permission === 'granted') {
    try {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: notification.id,
        requireInteraction: false,
      });
    } catch (error) {
      console.error('Erro ao enviar push notification:', error);
    }
  }
}

/**
 * Solicita permissão para notificações
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Verifica se notificações estão habilitadas
 */
export function areNotificationsEnabled(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Agenda verificação periódica de notificações
 */
export function scheduleNotificationChecks(userId: string): void {
  // Verificar a cada 5 minutos
  setInterval(() => {
    checkForNewOpportunities(userId);
  }, 5 * 60 * 1000);
}

/**
 * Verifica novas oportunidades e envia notificações
 */
async function checkForNewOpportunities(userId: string): Promise<void> {
  // Apenas para usuários premium
  if (!isPremiumUser(userId)) return;

  // Simular verificação de odds vantajosas
  const hasOpportunity = Math.random() > 0.8; // 20% de chance

  if (hasOpportunity) {
    const matches = [
      'Flamengo vs Palmeiras',
      'Real Madrid vs Barcelona',
      'Lakers vs Warriors',
    ];
    const match = matches[Math.floor(Math.random() * matches.length)];
    const odds = 2.5 + Math.random() * 2;

    notifyAdvantageousOdds(userId, match, Math.round(odds * 100) / 100);
  }
}

/**
 * Obtém estatísticas de notificações
 */
export function getNotificationStats(userId: string) {
  const all = getUserNotifications(userId);
  const unread = getUnreadNotifications(userId);

  const byType = {
    newPrediction: all.filter((n) => n.type === 'newPrediction').length,
    advantageousOdds: all.filter((n) => n.type === 'advantageousOdds').length,
    renewal: all.filter((n) => n.type === 'renewal').length,
    update: all.filter((n) => n.type === 'update').length,
  };

  return {
    total: all.length,
    unread: unread.length,
    read: all.length - unread.length,
    byType,
  };
}
