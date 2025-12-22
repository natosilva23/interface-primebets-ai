// ============================================
// AUTOMAÇÃO: RELATÓRIOS DE PERFORMANCE
// ============================================

import { getBetHistory } from '../services/history';
import { createNotification } from '../services/notifications';
import { isPremiumUser } from '../services/premium';

interface PerformanceStats {
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
  averageOdds: number;
  totalProfit: number;
  bestDay: string;
  worstDay: string;
  favoriteMarket: string;
  recommendations: string[];
}

/**
 * Agenda relatórios semanais de performance (toda segunda às 9h)
 */
export function schedulePerformanceReports(userId: string): void {
  // Calcular próxima segunda-feira às 9h
  const now = new Date();
  const nextMonday = new Date();
  
  // Ajustar para próxima segunda-feira
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(9, 0, 0, 0);

  const msUntilNext = nextMonday.getTime() - now.getTime();

  // Agendar primeira execução
  setTimeout(() => {
    sendWeeklyReport(userId);

    // Repetir a cada 7 dias
    setInterval(() => {
      sendWeeklyReport(userId);
    }, 7 * 24 * 60 * 60 * 1000);
  }, msUntilNext);

  console.log(`📊 Relatórios semanais agendados para ${nextMonday.toLocaleString()}`);
}

/**
 * Envia relatório semanal de performance
 */
async function sendWeeklyReport(userId: string): Promise<void> {
  try {
    // Calcular estatísticas da semana
    const stats = await calculateWeeklyStats(userId);

    // Gerar relatório personalizado
    const report = generateReport(stats);

    // Criar notificação
    createNotification(
      userId,
      'update',
      '📊 Seu Relatório Semanal Chegou!',
      `Taxa de acerto: ${stats.winRate.toFixed(1)}% | ${stats.wins} vitórias de ${stats.totalBets} apostas`,
      {
        stats,
        report,
      }
    );

    // Salvar relatório no histórico
    saveReport(userId, stats, report);

    console.log(`✅ Relatório semanal enviado para usuário ${userId}`);
  } catch (error) {
    console.error('❌ Erro ao enviar relatório semanal:', error);
  }
}

/**
 * Calcula estatísticas da última semana
 */
async function calculateWeeklyStats(userId: string): Promise<PerformanceStats> {
  const history = getBetHistory(userId);

  // Filtrar apostas da última semana
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weekBets = history.filter((bet) => new Date(bet.date) >= oneWeekAgo);

  // Calcular estatísticas
  const totalBets = weekBets.length;
  const wins = weekBets.filter((bet) => bet.result === 'win').length;
  const losses = weekBets.filter((bet) => bet.result === 'loss').length;
  const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;

  const averageOdds =
    totalBets > 0
      ? weekBets.reduce((sum, bet) => sum + bet.odds, 0) / totalBets
      : 0;

  // Calcular lucro (simulado)
  const totalProfit = weekBets.reduce((sum, bet) => {
    if (bet.result === 'win') {
      return sum + (bet.odds - 1) * 10; // Assumindo aposta de R$10
    }
    return sum - 10;
  }, 0);

  // Encontrar melhor e pior dia
  const betsByDay = groupBetsByDay(weekBets);
  const bestDay = findBestDay(betsByDay);
  const worstDay = findWorstDay(betsByDay);

  // Mercado favorito
  const favoriteMarket = findFavoriteMarket(weekBets);

  // Gerar recomendações
  const recommendations = generateRecommendations(weekBets, winRate);

  return {
    totalBets,
    wins,
    losses,
    winRate,
    averageOdds,
    totalProfit,
    bestDay,
    worstDay,
    favoriteMarket,
    recommendations,
  };
}

/**
 * Agrupa apostas por dia
 */
function groupBetsByDay(bets: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};

  bets.forEach((bet) => {
    const day = new Date(bet.date).toLocaleDateString();
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(bet);
  });

  return grouped;
}

/**
 * Encontra melhor dia da semana
 */
function findBestDay(betsByDay: Record<string, any[]>): string {
  let bestDay = '';
  let bestWinRate = 0;

  Object.entries(betsByDay).forEach(([day, bets]) => {
    const wins = bets.filter((b) => b.result === 'win').length;
    const winRate = (wins / bets.length) * 100;

    if (winRate > bestWinRate) {
      bestWinRate = winRate;
      bestDay = day;
    }
  });

  return bestDay || 'N/A';
}

/**
 * Encontra pior dia da semana
 */
function findWorstDay(betsByDay: Record<string, any[]>): string {
  let worstDay = '';
  let worstWinRate = 100;

  Object.entries(betsByDay).forEach(([day, bets]) => {
    const wins = bets.filter((b) => b.result === 'win').length;
    const winRate = (wins / bets.length) * 100;

    if (winRate < worstWinRate) {
      worstWinRate = winRate;
      worstDay = day;
    }
  });

  return worstDay || 'N/A';
}

/**
 * Encontra mercado favorito
 */
function findFavoriteMarket(bets: any[]): string {
  const marketCount: Record<string, number> = {};

  bets.forEach((bet) => {
    const market = bet.market || 'Resultado Final';
    marketCount[market] = (marketCount[market] || 0) + 1;
  });

  let favorite = 'Resultado Final';
  let maxCount = 0;

  Object.entries(marketCount).forEach(([market, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favorite = market;
    }
  });

  return favorite;
}

/**
 * Gera recomendações personalizadas
 */
function generateRecommendations(bets: any[], winRate: number): string[] {
  const recommendations: string[] = [];

  if (winRate < 40) {
    recommendations.push('Considere reduzir o risco das suas apostas');
    recommendations.push('Foque em odds mais baixas e seguras');
  } else if (winRate > 70) {
    recommendations.push('Excelente performance! Continue assim');
    recommendations.push('Você pode explorar odds um pouco mais altas');
  } else {
    recommendations.push('Performance equilibrada');
    recommendations.push('Mantenha a consistência nas suas escolhas');
  }

  if (bets.length < 5) {
    recommendations.push('Aumente o volume de apostas para análise mais precisa');
  }

  return recommendations;
}

/**
 * Gera relatório formatado
 */
function generateReport(stats: PerformanceStats): string {
  return `
📊 RELATÓRIO SEMANAL DE PERFORMANCE

🎯 Estatísticas Gerais:
• Total de apostas: ${stats.totalBets}
• Vitórias: ${stats.wins}
• Derrotas: ${stats.losses}
• Taxa de acerto: ${stats.winRate.toFixed(1)}%

💰 Financeiro:
• Odds média: ${stats.averageOdds.toFixed(2)}
• Lucro/Prejuízo: R$ ${stats.totalProfit.toFixed(2)}

📅 Análise Temporal:
• Melhor dia: ${stats.bestDay}
• Pior dia: ${stats.worstDay}

🎲 Preferências:
• Mercado favorito: ${stats.favoriteMarket}

💡 Recomendações:
${stats.recommendations.map((r) => `• ${r}`).join('\n')}
  `.trim();
}

/**
 * Salva relatório no histórico
 */
function saveReport(userId: string, stats: PerformanceStats, report: string): void {
  const reports = getReportsHistory(userId);

  reports.unshift({
    date: new Date().toISOString(),
    stats,
    report,
  });

  // Manter apenas últimos 12 relatórios (3 meses)
  if (reports.length > 12) {
    reports.pop();
  }

  localStorage.setItem(`performance_reports_${userId}`, JSON.stringify(reports));
}

/**
 * Obtém histórico de relatórios
 */
export function getReportsHistory(userId: string): any[] {
  const data = localStorage.getItem(`performance_reports_${userId}`);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}
