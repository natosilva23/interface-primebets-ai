// ============================================
// SERVIÇO: COMPARADOR DE PLATAFORMAS (PREMIUM)
// ============================================

import { BettingPlatform, PlatformComparison, PlatformMarket } from '../types';
import { BETTING_PLATFORMS } from '../constants/betting';
import { isPremiumUser } from './premium';

/**
 * Compara plataformas de apostas e retorna ranking
 * RECURSO PREMIUM - Requer assinatura ativa
 */
export async function comparePlatforms(
  userId: string,
  sport: string,
  market: string
): Promise<PlatformComparison> {
  // Verificar se usuário é premium
  if (!isPremiumUser(userId)) {
    throw new Error('PREMIUM_REQUIRED');
  }

  // Gerar dados de mercado para cada plataforma
  const platforms = generatePlatformData(sport, market);

  // Determinar melhor plataforma geral
  const bestOverall = findBestOverall(platforms);

  // Determinar melhor por mercado
  const bestByMarket = findBestByMarket(platforms);

  // Gerar recomendações
  const recommendations = generateRecommendations(platforms, sport, market);

  return {
    platforms,
    bestOverall,
    bestByMarket,
    recommendations,
  };
}

/**
 * Gera dados simulados de mercado para cada plataforma
 * Em produção, isso viria de APIs das plataformas ou web scraping
 */
function generatePlatformData(sport: string, market: string): BettingPlatform[] {
  return BETTING_PLATFORMS.map((platform) => {
    const markets = generateMarketsForPlatform(platform.id, sport, market);

    return {
      ...platform,
      markets,
    };
  });
}

/**
 * Gera mercados para uma plataforma específica
 */
function generateMarketsForPlatform(
  platformId: string,
  sport: string,
  targetMarket: string
): PlatformMarket[] {
  const baseOdds = 1.5 + Math.random() * 2; // 1.5 a 3.5
  
  // Cada plataforma tem variações nas odds
  const platformVariations: Record<string, number> = {
    bet365: 1.05,
    betano: 1.03,
    blaze: 0.98,
    sportingbet: 1.02,
    '1xbet': 1.08,
  };

  const variation = platformVariations[platformId] || 1.0;

  const markets: PlatformMarket[] = [
    {
      sport,
      market: 'match_result',
      averageOdds: Math.round(baseOdds * variation * 100) / 100,
      commission: BETTING_PLATFORMS.find((p) => p.id === platformId)?.commission || 0.05,
    },
    {
      sport,
      market: 'over_under',
      averageOdds: Math.round((baseOdds * 0.9) * variation * 100) / 100,
      commission: BETTING_PLATFORMS.find((p) => p.id === platformId)?.commission || 0.05,
    },
    {
      sport,
      market: 'both_score',
      averageOdds: Math.round((baseOdds * 1.1) * variation * 100) / 100,
      commission: BETTING_PLATFORMS.find((p) => p.id === platformId)?.commission || 0.05,
    },
  ];

  return markets;
}

/**
 * Encontra a melhor plataforma geral
 */
function findBestOverall(platforms: BettingPlatform[]): string {
  let bestPlatform = platforms[0];
  let bestScore = 0;

  platforms.forEach((platform) => {
    // Calcular score baseado em odds médias e rating
    const avgOdds =
      platform.markets.reduce((sum, m) => sum + m.averageOdds, 0) /
      platform.markets.length;
    
    const score = avgOdds * 0.7 + platform.rating * 0.3;

    if (score > bestScore) {
      bestScore = score;
      bestPlatform = platform;
    }
  });

  return bestPlatform.name;
}

/**
 * Encontra a melhor plataforma por mercado
 */
function findBestByMarket(platforms: BettingPlatform[]): Record<string, string> {
  const bestByMarket: Record<string, string> = {};

  // Coletar todos os mercados únicos
  const allMarkets = new Set<string>();
  platforms.forEach((platform) => {
    platform.markets.forEach((market) => {
      allMarkets.add(market.market);
    });
  });

  // Para cada mercado, encontrar melhor plataforma
  allMarkets.forEach((marketId) => {
    let bestPlatform = '';
    let bestOdds = 0;

    platforms.forEach((platform) => {
      const market = platform.markets.find((m) => m.market === marketId);
      if (market && market.averageOdds > bestOdds) {
        bestOdds = market.averageOdds;
        bestPlatform = platform.name;
      }
    });

    bestByMarket[marketId] = bestPlatform;
  });

  return bestByMarket;
}

/**
 * Gera recomendações personalizadas
 */
function generateRecommendations(
  platforms: BettingPlatform[],
  sport: string,
  market: string
): string[] {
  const recommendations: string[] = [];

  // Ordenar por odds médias
  const sortedByOdds = [...platforms].sort((a, b) => {
    const avgA = a.markets.reduce((sum, m) => sum + m.averageOdds, 0) / a.markets.length;
    const avgB = b.markets.reduce((sum, m) => sum + m.averageOdds, 0) / b.markets.length;
    return avgB - avgA;
  });

  // Recomendação 1: Melhor odds geral
  recommendations.push(
    `${sortedByOdds[0].name} oferece as melhores odds médias no momento (${sortedByOdds[0].logo})`
  );

  // Recomendação 2: Melhor rating
  const bestRating = [...platforms].sort((a, b) => b.rating - a.rating)[0];
  recommendations.push(
    `${bestRating.name} tem a melhor avaliação dos usuários (${bestRating.rating}/5.0)`
  );

  // Recomendação 3: Menor comissão
  const lowestCommission = [...platforms].sort((a, b) => {
    const commA = a.markets[0]?.commission || 0;
    const commB = b.markets[0]?.commission || 0;
    return commA - commB;
  })[0];
  recommendations.push(
    `${lowestCommission.name} cobra a menor comissão para este mercado`
  );

  // Recomendação 4: Específica do esporte
  recommendations.push(
    `Para ${sport}, recomendamos comparar odds em pelo menos 3 plataformas antes de apostar`
  );

  return recommendations;
}

/**
 * Obtém odds específicas de uma plataforma
 */
export function getPlatformOdds(
  platformId: string,
  sport: string,
  market: string
): number | null {
  const platform = BETTING_PLATFORMS.find((p) => p.id === platformId);
  if (!platform) return null;

  // Simular odds (em produção viria de API)
  const baseOdds = 1.5 + Math.random() * 2;
  const platformVariations: Record<string, number> = {
    bet365: 1.05,
    betano: 1.03,
    blaze: 0.98,
    sportingbet: 1.02,
    '1xbet': 1.08,
  };

  const variation = platformVariations[platformId] || 1.0;
  return Math.round(baseOdds * variation * 100) / 100;
}

/**
 * Compara odds entre plataformas para um jogo específico
 */
export async function compareOddsForMatch(
  userId: string,
  matchId: string,
  market: string
): Promise<Array<{ platform: string; odds: number }>> {
  // Verificar premium
  if (!isPremiumUser(userId)) {
    throw new Error('PREMIUM_REQUIRED');
  }

  // Simular comparação de odds
  return BETTING_PLATFORMS.map((platform) => ({
    platform: platform.name,
    odds: Math.round((1.5 + Math.random() * 2) * 100) / 100,
  })).sort((a, b) => b.odds - a.odds);
}

/**
 * Salva comparação no histórico
 */
export function saveComparison(userId: string, comparison: PlatformComparison): void {
  const history = getComparisonHistory(userId);
  history.push({
    ...comparison,
    timestamp: new Date().toISOString(),
  });

  // Manter apenas últimas 20 comparações
  if (history.length > 20) {
    history.shift();
  }

  localStorage.setItem(`comparison_history_${userId}`, JSON.stringify(history));
}

/**
 * Recupera histórico de comparações
 */
export function getComparisonHistory(userId: string): any[] {
  const data = localStorage.getItem(`comparison_history_${userId}`);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}
