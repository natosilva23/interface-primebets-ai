// ============================================
// IA DO COMPARADOR DE PLATAFORMAS
// ============================================

import { BettingPlatform } from '../types';

export interface PlatformOdds {
  platformId: string;
  platformName: string;
  odds: number;
  margin: number; // Margem da casa em %
}

export interface MarketComparison {
  sport: string;
  market: string;
  match: string;
  platforms: PlatformOdds[];
  bestPlatform: string;
  bestOdds: number;
  averageOdds: number;
  valueOpportunity: number; // % acima da média
}

export interface PlatformRanking {
  platformId: string;
  platformName: string;
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  bestMarkets: string[];
  averageOdds: number;
  averageMargin: number;
}

/**
 * Compara odds entre plataformas para um mercado específico
 */
export function compareMarketOdds(
  sport: string,
  market: string,
  match: string,
  platforms: BettingPlatform[]
): MarketComparison {
  // Simular odds de cada plataforma (em produção, viria de API)
  const platformOdds: PlatformOdds[] = platforms.map((platform) => {
    const baseOdds = 1.5 + Math.random() * 2.0;
    const margin = 3 + Math.random() * 7; // Margem entre 3-10%
    
    return {
      platformId: platform.id,
      platformName: platform.name,
      odds: Math.round(baseOdds * 100) / 100,
      margin: Math.round(margin * 10) / 10,
    };
  });

  // Ordenar por melhores odds
  platformOdds.sort((a, b) => b.odds - a.odds);

  const bestPlatform = platformOdds[0];
  const averageOdds = platformOdds.reduce((sum, p) => sum + p.odds, 0) / platformOdds.length;
  const valueOpportunity = ((bestPlatform.odds - averageOdds) / averageOdds) * 100;

  return {
    sport,
    market,
    match,
    platforms: platformOdds,
    bestPlatform: bestPlatform.platformName,
    bestOdds: bestPlatform.odds,
    averageOdds: Math.round(averageOdds * 100) / 100,
    valueOpportunity: Math.round(valueOpportunity * 10) / 10,
  };
}

/**
 * Gera ranking completo de plataformas
 */
export function generatePlatformRanking(platforms: BettingPlatform[]): PlatformRanking[] {
  return platforms.map((platform) => {
    // Calcular métricas
    const avgOdds = calculateAverageOdds(platform);
    const avgMargin = calculateAverageMargin(platform);
    
    // Calcular score (0-100)
    let score = 50;
    
    // Odds mais altas = melhor score
    score += (avgOdds - 1.8) * 20;
    
    // Margem mais baixa = melhor score
    score -= (avgMargin - 5) * 3;
    
    // Variedade de mercados
    score += Math.min(platform.markets.length * 2, 20);
    
    // Rating da plataforma
    score += platform.rating * 5;
    
    // Garantir limites
    score = Math.min(100, Math.max(0, score));

    // Identificar pontos fortes e fracos
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (avgOdds > 2.0) strengths.push('Odds competitivas');
    if (avgMargin < 5) strengths.push('Baixa margem da casa');
    if (platform.markets.length > 15) strengths.push('Grande variedade de mercados');
    if (platform.rating > 4.5) strengths.push('Excelente reputação');

    if (avgOdds < 1.8) weaknesses.push('Odds abaixo da média');
    if (avgMargin > 7) weaknesses.push('Margem alta');
    if (platform.markets.length < 10) weaknesses.push('Poucos mercados disponíveis');

    // Identificar melhores mercados
    const bestMarkets = platform.markets
      .sort((a, b) => b.averageOdds - a.averageOdds)
      .slice(0, 3)
      .map((m) => m.market);

    return {
      platformId: platform.id,
      platformName: platform.name,
      score: Math.round(score),
      strengths,
      weaknesses,
      bestMarkets,
      averageOdds: Math.round(avgOdds * 100) / 100,
      averageMargin: Math.round(avgMargin * 10) / 10,
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Calcula odds média de uma plataforma
 */
function calculateAverageOdds(platform: BettingPlatform): number {
  if (platform.markets.length === 0) return 1.8;
  
  const total = platform.markets.reduce((sum, m) => sum + m.averageOdds, 0);
  return total / platform.markets.length;
}

/**
 * Calcula margem média de uma plataforma
 */
function calculateAverageMargin(platform: BettingPlatform): number {
  if (platform.markets.length === 0) return 5;
  
  const total = platform.markets.reduce((sum, m) => sum + m.commission, 0);
  return total / platform.markets.length;
}

/**
 * Identifica oportunidades de valor entre plataformas
 */
export function findValueOpportunities(
  platforms: BettingPlatform[],
  minValueThreshold: number = 5 // % mínimo acima da média
): Array<{
  match: string;
  market: string;
  platform: string;
  odds: number;
  valuePercentage: number;
  recommendation: string;
}> {
  const opportunities: Array<{
    match: string;
    market: string;
    platform: string;
    odds: number;
    valuePercentage: number;
    recommendation: string;
  }> = [];

  // Simular análise de múltiplos jogos
  const mockMatches = [
    'Flamengo vs Palmeiras',
    'Real Madrid vs Barcelona',
    'Lakers vs Warriors',
  ];

  const mockMarkets = ['match_result', 'over_under', 'both_score'];

  mockMatches.forEach((match) => {
    mockMarkets.forEach((market) => {
      const comparison = compareMarketOdds('football', market, match, platforms);
      
      if (comparison.valueOpportunity >= minValueThreshold) {
        opportunities.push({
          match,
          market,
          platform: comparison.bestPlatform,
          odds: comparison.bestOdds,
          valuePercentage: comparison.valueOpportunity,
          recommendation: `${comparison.bestPlatform} está pagando ${comparison.valueOpportunity.toFixed(1)}% acima da média do mercado. Oportunidade de valor!`,
        });
      }
    });
  });

  // Ordenar por maior valor
  return opportunities.sort((a, b) => b.valuePercentage - a.valuePercentage);
}

/**
 * Gera recomendação de plataforma baseada em critérios
 */
export function recommendPlatform(
  platforms: BettingPlatform[],
  criteria: {
    sport?: string;
    market?: string;
    prioritizeOdds?: boolean;
    prioritizeSafety?: boolean;
  }
): {
  recommended: BettingPlatform;
  reason: string;
  alternatives: BettingPlatform[];
} {
  let scored = platforms.map((platform) => {
    let score = 0;

    // Priorizar odds
    if (criteria.prioritizeOdds) {
      const avgOdds = calculateAverageOdds(platform);
      score += avgOdds * 30;
    }

    // Priorizar segurança
    if (criteria.prioritizeSafety) {
      score += platform.rating * 20;
    }

    // Filtrar por esporte/mercado específico
    if (criteria.sport || criteria.market) {
      const hasMarket = platform.markets.some(
        (m) =>
          (!criteria.sport || m.sport === criteria.sport) &&
          (!criteria.market || m.market === criteria.market)
      );
      if (hasMarket) score += 50;
    }

    return { platform, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const recommended = scored[0].platform;
  const alternatives = scored.slice(1, 3).map((s) => s.platform);

  let reason = `${recommended.name} é a melhor opção `;
  
  if (criteria.prioritizeOdds) {
    reason += 'pelas odds competitivas ';
  }
  if (criteria.prioritizeSafety) {
    reason += 'pela segurança e reputação ';
  }
  if (criteria.sport) {
    reason += `para ${criteria.sport} `;
  }
  
  reason += `(Rating: ${recommended.rating}/5).`;

  return {
    recommended,
    reason,
    alternatives,
  };
}

/**
 * Calcula retorno potencial comparando plataformas
 */
export function calculateReturnComparison(
  stake: number,
  platforms: BettingPlatform[],
  market: string
): Array<{
  platform: string;
  odds: number;
  potentialReturn: number;
  profit: number;
  difference: number; // Diferença em relação à melhor
}> {
  const comparison = compareMarketOdds('football', market, 'Match Example', platforms);
  
  const returns = comparison.platforms.map((p) => {
    const potentialReturn = stake * p.odds;
    const profit = potentialReturn - stake;
    
    return {
      platform: p.platformName,
      odds: p.odds,
      potentialReturn: Math.round(potentialReturn * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      difference: 0, // Será calculado depois
    };
  });

  // Ordenar por maior retorno
  returns.sort((a, b) => b.potentialReturn - a.potentialReturn);

  // Calcular diferença em relação ao melhor
  const bestReturn = returns[0].potentialReturn;
  returns.forEach((r) => {
    r.difference = Math.round((bestReturn - r.potentialReturn) * 100) / 100;
  });

  return returns;
}

/**
 * Gera alerta de mudança significativa de odds
 */
export function detectOddsMovement(
  previousOdds: number,
  currentOdds: number,
  threshold: number = 10 // % de mudança
): {
  hasSignificantChange: boolean;
  changePercentage: number;
  direction: 'up' | 'down';
  alert: string;
} | null {
  const changePercentage = ((currentOdds - previousOdds) / previousOdds) * 100;
  
  if (Math.abs(changePercentage) < threshold) {
    return null;
  }

  const direction = changePercentage > 0 ? 'up' : 'down';
  
  let alert = '';
  if (direction === 'up') {
    alert = `⬆️ Odds subiram ${Math.abs(changePercentage).toFixed(1)}%! De ${previousOdds} para ${currentOdds}. Oportunidade de valor aumentou.`;
  } else {
    alert = `⬇️ Odds caíram ${Math.abs(changePercentage).toFixed(1)}%! De ${previousOdds} para ${currentOdds}. Mercado está ajustando probabilidades.`;
  }

  return {
    hasSignificantChange: true,
    changePercentage: Math.round(changePercentage * 10) / 10,
    direction,
    alert,
  };
}
