// ============================================
// IA DE ALERTAS INTELIGENTES
// ============================================

import { BettorStyle } from '../types';

export interface Alert {
  id: string;
  type: 'odds_change' | 'match_starting' | 'recommended_entry' | 'value_opportunity' | 'risk_warning';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  actionable: boolean;
  action?: {
    label: string;
    data: any;
  };
  timestamp: Date;
  expiresAt?: Date;
}

export interface OddsMonitor {
  matchId: string;
  match: string;
  market: string;
  initialOdds: number;
  currentOdds: number;
  threshold: number; // % de mudança para alertar
}

/**
 * Monitora mudanças de odds e gera alertas
 */
export function monitorOddsChanges(monitors: OddsMonitor[]): Alert[] {
  const alerts: Alert[] = [];

  monitors.forEach((monitor) => {
    const changePercentage = ((monitor.currentOdds - monitor.initialOdds) / monitor.initialOdds) * 100;

    if (Math.abs(changePercentage) >= monitor.threshold) {
      const direction = changePercentage > 0 ? 'subiram' : 'caíram';
      const emoji = changePercentage > 0 ? '📈' : '📉';

      alerts.push({
        id: `odds_${monitor.matchId}_${Date.now()}`,
        type: 'odds_change',
        priority: Math.abs(changePercentage) > 15 ? 'high' : 'medium',
        title: `${emoji} Odds ${direction}!`,
        message: `${monitor.match} - ${monitor.market}: Odds ${direction} ${Math.abs(changePercentage).toFixed(1)}% (${monitor.initialOdds} → ${monitor.currentOdds})`,
        actionable: true,
        action: {
          label: 'Ver Detalhes',
          data: {
            matchId: monitor.matchId,
            market: monitor.market,
          },
        },
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // Expira em 30 min
      });
    }
  });

  return alerts;
}

/**
 * Gera alertas de partidas começando
 */
export function generateMatchStartingAlerts(
  upcomingMatches: Array<{
    id: string;
    match: string;
    startTime: Date;
    hasActiveBet: boolean;
  }>,
  notifyMinutesBefore: number = 15
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  upcomingMatches.forEach((match) => {
    const minutesUntilStart = (match.startTime.getTime() - now.getTime()) / (1000 * 60);

    if (minutesUntilStart > 0 && minutesUntilStart <= notifyMinutesBefore) {
      alerts.push({
        id: `match_starting_${match.id}`,
        type: 'match_starting',
        priority: match.hasActiveBet ? 'high' : 'medium',
        title: '⏰ Partida começando em breve',
        message: `${match.match} começa em ${Math.round(minutesUntilStart)} minutos${
          match.hasActiveBet ? ' (você tem aposta ativa)' : ''
        }`,
        actionable: !match.hasActiveBet,
        action: !match.hasActiveBet
          ? {
              label: 'Apostar Agora',
              data: { matchId: match.id },
            }
          : undefined,
        timestamp: now,
        expiresAt: match.startTime,
      });
    }
  });

  return alerts;
}

/**
 * Gera alertas de entrada recomendada
 */
export function generateRecommendedEntryAlerts(
  style: BettorStyle,
  opportunities: Array<{
    id: string;
    match: string;
    market: string;
    odds: number;
    confidence: number;
    reasoning: string;
  }>
): Alert[] {
  const alerts: Alert[] = [];

  // Filtrar oportunidades baseadas no estilo
  const filtered = opportunities.filter((opp) => {
    switch (style) {
      case 'conservative':
        return opp.odds >= 1.3 && opp.odds <= 1.8 && opp.confidence >= 80;
      case 'balanced':
        return opp.odds >= 1.6 && opp.odds <= 2.5 && opp.confidence >= 70;
      case 'highRisk':
        return opp.odds >= 2.5 && opp.confidence >= 60;
      case 'strategic':
        return opp.confidence >= 75; // Estratégicos focam em confiança
      case 'recreational':
        return opp.odds >= 1.5 && opp.odds <= 3.5;
      default:
        return true;
    }
  });

  // Gerar alertas para top 3 oportunidades
  filtered.slice(0, 3).forEach((opp, index) => {
    alerts.push({
      id: `recommended_${opp.id}`,
      type: 'recommended_entry',
      priority: index === 0 ? 'high' : 'medium',
      title: '🎯 Entrada Recomendada',
      message: `${opp.match} - ${opp.market}: Odds ${opp.odds} com ${opp.confidence}% de confiança. ${opp.reasoning}`,
      actionable: true,
      action: {
        label: 'Ver Análise',
        data: {
          matchId: opp.id,
          market: opp.market,
        },
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // Expira em 2h
    });
  });

  return alerts;
}

/**
 * Gera alertas de oportunidades de valor
 */
export function generateValueOpportunityAlerts(
  valueOpportunities: Array<{
    match: string;
    market: string;
    platform: string;
    odds: number;
    valuePercentage: number;
  }>
): Alert[] {
  const alerts: Alert[] = [];

  // Alertar apenas oportunidades com valor > 8%
  const significant = valueOpportunities.filter((opp) => opp.valuePercentage > 8);

  significant.forEach((opp) => {
    alerts.push({
      id: `value_${opp.match}_${opp.market}`,
      type: 'value_opportunity',
      priority: opp.valuePercentage > 15 ? 'high' : 'medium',
      title: '💎 Oportunidade de Valor',
      message: `${opp.platform} está pagando ${opp.valuePercentage.toFixed(1)}% acima da média em ${opp.match} - ${opp.market} (Odds: ${opp.odds})`,
      actionable: true,
      action: {
        label: 'Comparar Plataformas',
        data: {
          match: opp.match,
          market: opp.market,
        },
      },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Expira em 1h
    });
  });

  return alerts;
}

/**
 * Gera alertas de risco
 */
export function generateRiskWarningAlerts(
  userBehavior: {
    betsLast24h: number;
    totalStakeLast24h: number;
    bankroll: number;
    losingStreak: number;
  }
): Alert[] {
  const alerts: Alert[] = [];

  // Alerta de muitas apostas
  if (userBehavior.betsLast24h > 10) {
    alerts.push({
      id: `risk_too_many_bets`,
      type: 'risk_warning',
      priority: 'urgent',
      title: '⚠️ Alerta de Risco',
      message: `Você fez ${userBehavior.betsLast24h} apostas nas últimas 24h. Isso pode indicar apostas impulsivas. Considere fazer uma pausa.`,
      actionable: false,
      timestamp: new Date(),
    });
  }

  // Alerta de stake muito alto
  const stakePercentage = (userBehavior.totalStakeLast24h / userBehavior.bankroll) * 100;
  if (stakePercentage > 20) {
    alerts.push({
      id: `risk_high_stake`,
      type: 'risk_warning',
      priority: 'urgent',
      title: '🚨 Gestão de Banca em Risco',
      message: `Você apostou ${stakePercentage.toFixed(1)}% do seu bankroll nas últimas 24h. Recomendamos não ultrapassar 10% ao dia.`,
      actionable: false,
      timestamp: new Date(),
    });
  }

  // Alerta de sequência negativa
  if (userBehavior.losingStreak >= 5) {
    alerts.push({
      id: `risk_losing_streak`,
      type: 'risk_warning',
      priority: 'high',
      title: '📉 Sequência Negativa',
      message: `Você está em uma sequência de ${userBehavior.losingStreak} derrotas. Considere:\n• Fazer uma pausa de 24-48h\n• Reduzir stakes temporariamente\n• Revisar sua estratégia`,
      actionable: false,
      timestamp: new Date(),
    });
  }

  return alerts;
}

/**
 * Sistema de notificações push (simulado)
 */
export class AlertNotificationSystem {
  private subscribers: Map<string, (alert: Alert) => void> = new Map();
  private activeAlerts: Alert[] = [];

  /**
   * Inscreve usuário para receber alertas
   */
  subscribe(userId: string, callback: (alert: Alert) => void): void {
    this.subscribers.set(userId, callback);
  }

  /**
   * Cancela inscrição
   */
  unsubscribe(userId: string): void {
    this.subscribers.delete(userId);
  }

  /**
   * Envia alerta para usuário
   */
  sendAlert(userId: string, alert: Alert): void {
    // Adicionar aos alertas ativos
    this.activeAlerts.push(alert);

    // Limpar alertas expirados
    this.cleanExpiredAlerts();

    // Notificar usuário
    const callback = this.subscribers.get(userId);
    if (callback) {
      callback(alert);
    }

    // Salvar no localStorage para persistência
    this.saveAlertToStorage(userId, alert);
  }

  /**
   * Envia múltiplos alertas
   */
  sendAlerts(userId: string, alerts: Alert[]): void {
    alerts.forEach((alert) => this.sendAlert(userId, alert));
  }

  /**
   * Obtém alertas ativos do usuário
   */
  getActiveAlerts(userId: string): Alert[] {
    const stored = localStorage.getItem(`alerts_${userId}`);
    if (!stored) return [];

    try {
      const alerts = JSON.parse(stored) as Alert[];
      // Filtrar alertas não expirados
      return alerts.filter((alert) => {
        if (!alert.expiresAt) return true;
        return new Date(alert.expiresAt) > new Date();
      });
    } catch {
      return [];
    }
  }

  /**
   * Marca alerta como lido
   */
  markAsRead(userId: string, alertId: string): void {
    const alerts = this.getActiveAlerts(userId);
    const filtered = alerts.filter((a) => a.id !== alertId);
    localStorage.setItem(`alerts_${userId}`, JSON.stringify(filtered));
  }

  /**
   * Limpa todos os alertas do usuário
   */
  clearAllAlerts(userId: string): void {
    localStorage.removeItem(`alerts_${userId}`);
    this.activeAlerts = [];
  }

  /**
   * Salva alerta no localStorage
   */
  private saveAlertToStorage(userId: string, alert: Alert): void {
    const existing = this.getActiveAlerts(userId);
    existing.push(alert);
    localStorage.setItem(`alerts_${userId}`, JSON.stringify(existing));
  }

  /**
   * Remove alertas expirados
   */
  private cleanExpiredAlerts(): void {
    const now = new Date();
    this.activeAlerts = this.activeAlerts.filter((alert) => {
      if (!alert.expiresAt) return true;
      return new Date(alert.expiresAt) > now;
    });
  }
}

/**
 * Instância global do sistema de alertas
 */
export const alertSystem = new AlertNotificationSystem();

/**
 * Configura monitoramento automático de alertas
 */
export function setupAutomaticAlertMonitoring(
  userId: string,
  style: BettorStyle,
  config: {
    oddsChangeThreshold: number;
    matchStartingMinutes: number;
    checkIntervalMinutes: number;
  }
): () => void {
  const interval = setInterval(() => {
    // Aqui você integraria com APIs reais para buscar dados atualizados
    // Por enquanto, apenas demonstração da estrutura

    // Exemplo: Verificar mudanças de odds
    // const oddsAlerts = monitorOddsChanges(currentMonitors);
    // alertSystem.sendAlerts(userId, oddsAlerts);

    // Exemplo: Verificar partidas começando
    // const matchAlerts = generateMatchStartingAlerts(upcomingMatches);
    // alertSystem.sendAlerts(userId, matchAlerts);

    console.log('Monitoramento de alertas ativo...');
  }, config.checkIntervalMinutes * 60 * 1000);

  // Retorna função para cancelar monitoramento
  return () => clearInterval(interval);
}

/**
 * Gera resumo diário de alertas
 */
export function generateDailyAlertSummary(userId: string): {
  total: number;
  byType: Record<Alert['type'], number>;
  byPriority: Record<Alert['priority'], number>;
  mostImportant: Alert[];
} {
  const alerts = alertSystem.getActiveAlerts(userId);

  const byType: Record<string, number> = {};
  const byPriority: Record<string, number> = {};

  alerts.forEach((alert) => {
    byType[alert.type] = (byType[alert.type] || 0) + 1;
    byPriority[alert.priority] = (byPriority[alert.priority] || 0) + 1;
  });

  // Pegar os 5 mais importantes (urgent e high priority)
  const mostImportant = alerts
    .filter((a) => a.priority === 'urgent' || a.priority === 'high')
    .sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 5);

  return {
    total: alerts.length,
    byType: byType as any,
    byPriority: byPriority as any,
    mostImportant,
  };
}
