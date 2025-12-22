// ============================================
// HOOK: useAutomations
// ============================================

'use client';

import { useEffect, useState } from 'react';
import {
  initializeAutomations,
  stopAllAutomations,
  restartAutomations,
} from './index';
import { AUTOMATION_CONFIG, isAutomationEnabled } from './config';
import { getLastUpdateTime, isPlatformDataStale } from './platform-updates';
import { getReportsHistory } from './performance-reports';
import { getSubscriptionStatus } from './premium-checks';
import { getUpcomingReminders } from './renewal-reminders';

/**
 * Hook para gerenciar automações do app
 */
export function useAutomations(userId: string | null) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [automationsStatus, setAutomationsStatus] = useState({
    dailyPredictions: false,
    platformUpdates: false,
    performanceReports: false,
    premiumChecks: false,
    renewalReminders: false,
  });

  // Inicializar automações quando usuário logar
  useEffect(() => {
    if (!userId) {
      stopAllAutomations();
      setIsInitialized(false);
      return;
    }

    initializeAutomations(userId);
    setIsInitialized(true);

    // Atualizar status das automações
    setAutomationsStatus({
      dailyPredictions: isAutomationEnabled('dailyPredictions'),
      platformUpdates: isAutomationEnabled('platformUpdates'),
      performanceReports: isAutomationEnabled('performanceReports'),
      premiumChecks: isAutomationEnabled('premiumChecks'),
      renewalReminders: isAutomationEnabled('renewalReminders'),
    });

    // Cleanup ao desmontar
    return () => {
      stopAllAutomations();
    };
  }, [userId]);

  /**
   * Reinicia todas as automações
   */
  const restart = () => {
    if (!userId) return;
    restartAutomations(userId);
  };

  /**
   * Para todas as automações
   */
  const stop = () => {
    stopAllAutomations();
    setIsInitialized(false);
  };

  /**
   * Obtém status das plataformas
   */
  const getPlatformsStatus = () => {
    return {
      lastUpdate: getLastUpdateTime(),
      isStale: isPlatformDataStale(),
    };
  };

  /**
   * Obtém histórico de relatórios
   */
  const getReports = () => {
    if (!userId) return [];
    return getReportsHistory(userId);
  };

  /**
   * Obtém status da assinatura
   */
  const getSubscription = () => {
    if (!userId) return null;
    return getSubscriptionStatus(userId);
  };

  /**
   * Obtém próximos lembretes
   */
  const getReminders = () => {
    if (!userId) return [];
    return getUpcomingReminders(userId);
  };

  return {
    isInitialized,
    automationsStatus,
    restart,
    stop,
    getPlatformsStatus,
    getReports,
    getSubscription,
    getReminders,
    config: AUTOMATION_CONFIG,
  };
}
