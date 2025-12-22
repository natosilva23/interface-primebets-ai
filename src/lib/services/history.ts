// ============================================
// SERVIÇO: HISTÓRICO E ESTATÍSTICAS
// ============================================

import { BetHistory, UserStatistics, WeeklyStats, Prediction } from '../types';

/**
 * Salva aposta no histórico
 */
export function saveBetToHistory(
  userId: string,
  predictionId: string,
  stake: number,
  odds: number
): BetHistory {
  const bet: BetHistory = {
    id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    predictionId,
    stake,
    odds,
    result: 'pending',
    placedAt: new Date(),
  };

  const history = getBetHistory(userId);
  history.push(bet);

  localStorage.setItem(`bet_history_${userId}`, JSON.stringify(history));

  return bet;
}

/**
 * Obtém histórico de apostas do usuário
 */
export function getBetHistory(userId: string): BetHistory[] {
  const data = localStorage.getItem(`bet_history_${userId}`);
  if (!data) return [];

  try {
    const history = JSON.parse(data);
    return history.map((bet: any) => ({
      ...bet,
      placedAt: new Date(bet.placedAt),
      settledAt: bet.settledAt ? new Date(bet.settledAt) : undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Atualiza resultado de uma aposta
 */
export function updateBetResult(
  userId: string,
  betId: string,
  result: 'win' | 'loss'
): void {
  const history = getBetHistory(userId);
  const bet = history.find((b) => b.id === betId);

  if (!bet) return;

  bet.result = result;
  bet.settledAt = new Date();

  if (result === 'win') {
    bet.profit = bet.stake * bet.odds - bet.stake;
  } else {
    bet.profit = -bet.stake;
  }

  localStorage.setItem(`bet_history_${userId}`, JSON.stringify(history));
}

/**
 * Calcula estatísticas do usuário
 */
export function calculateUserStatistics(userId: string): UserStatistics {
  const history = getBetHistory(userId);

  const totalBets = history.length;
  const wonBets = history.filter((b) => b.result === 'win').length;
  const lostBets = history.filter((b) => b.result === 'loss').length;
  const pendingBets = history.filter((b) => b.result === 'pending').length;

  const winRate = totalBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;

  const totalProfit = history
    .filter((b) => b.profit !== undefined)
    .reduce((sum, b) => sum + (b.profit || 0), 0);

  const settledBets = history.filter((b) => b.result !== 'pending');
  const averageOdds =
    settledBets.length > 0
      ? settledBets.reduce((sum, b) => sum + b.odds, 0) / settledBets.length
      : 0;

  const bestStreak = calculateBestStreak(history);
  const currentStreak = calculateCurrentStreak(history);

  const weeklyEvolution = calculateWeeklyEvolution(history);

  return {
    userId,
    totalBets,
    wonBets,
    lostBets,
    pendingBets,
    winRate: Math.round(winRate * 10) / 10,
    totalProfit: Math.round(totalProfit * 100) / 100,
    averageOdds: Math.round(averageOdds * 100) / 100,
    bestStreak,
    currentStreak,
    weeklyEvolution,
  };
}

/**
 * Calcula melhor sequência de vitórias
 */
function calculateBestStreak(history: BetHistory[]): number {
  let bestStreak = 0;
  let currentStreak = 0;

  const sortedHistory = [...history]
    .filter((b) => b.result !== 'pending')
    .sort((a, b) => a.placedAt.getTime() - b.placedAt.getTime());

  sortedHistory.forEach((bet) => {
    if (bet.result === 'win') {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  return bestStreak;
}

/**
 * Calcula sequência atual
 */
function calculateCurrentStreak(history: BetHistory[]): number {
  const sortedHistory = [...history]
    .filter((b) => b.result !== 'pending')
    .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime());

  let streak = 0;
  const lastResult = sortedHistory[0]?.result;

  if (!lastResult) return 0;

  for (const bet of sortedHistory) {
    if (bet.result === lastResult) {
      streak++;
    } else {
      break;
    }
  }

  return lastResult === 'win' ? streak : -streak;
}

/**
 * Calcula evolução semanal
 */
function calculateWeeklyEvolution(history: BetHistory[]): WeeklyStats[] {
  const weeks: Map<string, WeeklyStats> = new Map();

  history
    .filter((b) => b.result !== 'pending')
    .forEach((bet) => {
      const weekKey = getWeekKey(bet.placedAt);

      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, {
          week: weekKey,
          bets: 0,
          wins: 0,
          profit: 0,
          winRate: 0,
        });
      }

      const weekStats = weeks.get(weekKey)!;
      weekStats.bets++;

      if (bet.result === 'win') {
        weekStats.wins++;
      }

      weekStats.profit += bet.profit || 0;
    });

  // Calcular win rate
  weeks.forEach((stats) => {
    stats.winRate = stats.bets > 0 ? (stats.wins / stats.bets) * 100 : 0;
    stats.winRate = Math.round(stats.winRate * 10) / 10;
    stats.profit = Math.round(stats.profit * 100) / 100;
  });

  // Converter para array e ordenar por semana
  return Array.from(weeks.values())
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12); // Últimas 12 semanas
}

/**
 * Obtém chave da semana (formato: YYYY-Www)
 */
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Obtém estatísticas de um período específico
 */
export function getStatsByPeriod(
  userId: string,
  startDate: Date,
  endDate: Date
): Partial<UserStatistics> {
  const history = getBetHistory(userId).filter(
    (bet) => bet.placedAt >= startDate && bet.placedAt <= endDate
  );

  const totalBets = history.length;
  const wonBets = history.filter((b) => b.result === 'win').length;
  const lostBets = history.filter((b) => b.result === 'loss').length;

  const winRate = totalBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;

  const totalProfit = history
    .filter((b) => b.profit !== undefined)
    .reduce((sum, b) => sum + (b.profit || 0), 0);

  return {
    totalBets,
    wonBets,
    lostBets,
    winRate: Math.round(winRate * 10) / 10,
    totalProfit: Math.round(totalProfit * 100) / 100,
  };
}

/**
 * Obtém apostas recentes
 */
export function getRecentBets(userId: string, limit: number = 10): BetHistory[] {
  const history = getBetHistory(userId);
  return history
    .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime())
    .slice(0, limit);
}

/**
 * Obtém apostas pendentes
 */
export function getPendingBets(userId: string): BetHistory[] {
  return getBetHistory(userId).filter((b) => b.result === 'pending');
}

/**
 * Obtém melhor aposta (maior lucro)
 */
export function getBestBet(userId: string): BetHistory | null {
  const history = getBetHistory(userId).filter((b) => b.result === 'win');

  if (history.length === 0) return null;

  return history.reduce((best, current) => {
    const currentProfit = current.profit || 0;
    const bestProfit = best.profit || 0;
    return currentProfit > bestProfit ? current : best;
  });
}

/**
 * Obtém pior aposta (maior perda)
 */
export function getWorstBet(userId: string): BetHistory | null {
  const history = getBetHistory(userId).filter((b) => b.result === 'loss');

  if (history.length === 0) return null;

  return history.reduce((worst, current) => {
    const currentProfit = current.profit || 0;
    const worstProfit = worst.profit || 0;
    return currentProfit < worstProfit ? current : worst;
  });
}

/**
 * Exporta histórico para CSV
 */
export function exportHistoryToCSV(userId: string): string {
  const history = getBetHistory(userId);

  const headers = [
    'Data',
    'Aposta',
    'Stake',
    'Odds',
    'Resultado',
    'Lucro',
  ].join(',');

  const rows = history.map((bet) => {
    return [
      bet.placedAt.toLocaleDateString('pt-BR'),
      bet.predictionId,
      bet.stake.toFixed(2),
      bet.odds.toFixed(2),
      bet.result || 'pendente',
      bet.profit?.toFixed(2) || '0.00',
    ].join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Limpa histórico antigo (mais de 1 ano)
 */
export function cleanOldHistory(userId: string): void {
  const history = getBetHistory(userId);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const recentHistory = history.filter((bet) => bet.placedAt >= oneYearAgo);

  localStorage.setItem(`bet_history_${userId}`, JSON.stringify(recentHistory));
}
