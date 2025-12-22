// ============================================
// HOOK PARA GERENCIAR AUTOMAÇÕES NO FRONTEND
// ============================================

'use client';

import { useEffect, useState } from 'react';
import {
  initializeAutomations,
  stopAllAutomations,
  restartAutomations,
  getAutomationsStatus,
  stopAutomation,
  restartAutomation,
} from './index';
import { getUnreadNotifications, getUnreadCount } from './notifications-handler';

interface AutomationStatus {
  id: string;
  name: string;
  enabled: boolean;
  lastRun: Date | null;
  nextRun: Date;
}

export function useAutomations(userId?: string) {
  const [automations, setAutomations] = useState<AutomationStatus[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar automações quando componente montar
  useEffect(() => {
    initializeAutomations();
    loadAutomationsStatus();
    setIsLoading(false);

    // Atualizar status a cada 30 segundos
    const interval = setInterval(() => {
      loadAutomationsStatus();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Carregar notificações quando userId mudar
  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadUnreadCount();

      // Atualizar notificações a cada minuto
      const interval = setInterval(() => {
        loadNotifications();
        loadUnreadCount();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [userId]);

  const loadAutomationsStatus = () => {
    const status = getAutomationsStatus();
    setAutomations(status);
  };

  const loadNotifications = async () => {
    if (!userId) return;
    const notifs = await getUnreadNotifications(userId);
    setNotifications(notifs);
  };

  const loadUnreadCount = async () => {
    if (!userId) return;
    const count = await getUnreadCount(userId);
    setUnreadCount(count);
  };

  const stopAll = () => {
    stopAllAutomations();
    loadAutomationsStatus();
  };

  const restartAll = () => {
    restartAutomations();
    loadAutomationsStatus();
  };

  const stop = (name: string) => {
    stopAutomation(name);
    loadAutomationsStatus();
  };

  const restart = (name: string) => {
    restartAutomation(name);
    loadAutomationsStatus();
  };

  const refreshNotifications = () => {
    loadNotifications();
    loadUnreadCount();
  };

  return {
    automations,
    notifications,
    unreadCount,
    isLoading,
    stopAll,
    restartAll,
    stop,
    restart,
    refreshNotifications,
  };
}
