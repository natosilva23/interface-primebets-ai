// ============================================
// CONFIGURAÇÃO DAS AUTOMAÇÕES
// ============================================

export const AUTOMATION_CONFIG = {
  // Notificações diárias de palpites
  dailyPredictions: {
    enabled: true,
    time: '08:00', // 8h da manhã
    timezone: 'America/Sao_Paulo',
  },

  // Atualização de plataformas
  platformUpdates: {
    enabled: true,
    intervalHours: 6, // A cada 6 horas
    retryOnError: true,
    maxRetries: 3,
  },

  // Relatórios de performance
  performanceReports: {
    enabled: true,
    day: 'monday', // Segunda-feira
    time: '09:00', // 9h da manhã
    includeRecommendations: true,
  },

  // Verificação de status premium
  premiumChecks: {
    enabled: true,
    intervalHours: 1, // A cada 1 hora
    autoRenew: true,
    notifyOnExpiration: true,
  },

  // Lembretes de renovação
  renewalReminders: {
    enabled: true,
    time: '10:00', // 10h da manhã
    reminderDays: [7, 3, 1, 0], // Dias antes da expiração
    urgencyLevels: {
      7: 'warning',
      3: 'urgent',
      1: 'critical',
      0: 'expired',
    },
  },

  // Monitoramento de odds
  oddsMonitoring: {
    enabled: true,
    intervalMinutes: 15, // A cada 15 minutos
    premiumOnly: true,
    thresholdChange: 0.1, // Notificar se odds mudar 10%+
  },
};

/**
 * Obtém configuração de uma automação específica
 */
export function getAutomationConfig(name: keyof typeof AUTOMATION_CONFIG) {
  return AUTOMATION_CONFIG[name];
}

/**
 * Verifica se automação está habilitada
 */
export function isAutomationEnabled(name: keyof typeof AUTOMATION_CONFIG): boolean {
  return AUTOMATION_CONFIG[name]?.enabled || false;
}

/**
 * Atualiza configuração de automação
 */
export function updateAutomationConfig(
  name: keyof typeof AUTOMATION_CONFIG,
  config: Partial<any>
): void {
  AUTOMATION_CONFIG[name] = {
    ...AUTOMATION_CONFIG[name],
    ...config,
  };

  // Salvar no localStorage
  localStorage.setItem('automation_config', JSON.stringify(AUTOMATION_CONFIG));
}

/**
 * Restaura configurações padrão
 */
export function resetAutomationConfig(): void {
  localStorage.removeItem('automation_config');
}

/**
 * Carrega configurações salvas
 */
export function loadAutomationConfig(): void {
  const saved = localStorage.getItem('automation_config');
  if (!saved) return;

  try {
    const config = JSON.parse(saved);
    Object.assign(AUTOMATION_CONFIG, config);
  } catch (error) {
    console.error('Erro ao carregar configurações de automação:', error);
  }
}

// Carregar configurações ao inicializar
if (typeof window !== 'undefined') {
  loadAutomationConfig();
}
