// ============================================
// IA PERSONALIZADA POR ESTILO DE APOSTADOR
// ============================================

import { BettorStyle } from '../types';
import { SmartRecommendation } from './predictions';

export interface PersonalizedStrategy {
  preferredOddsRange: [number, number];
  maxPredictionsPerDay: number;
  riskTolerance: 'low' | 'medium' | 'high';
  betTypes: string[];
  stakeRecommendation: number; // % do bankroll
  multipleStrategy: 'avoid' | 'occasional' | 'frequent';
}

/**
 * Define estratégia personalizada baseada no estilo do apostador
 */
export function getPersonalizedStrategy(style: BettorStyle): PersonalizedStrategy {
  const strategies: Record<BettorStyle, PersonalizedStrategy> = {
    conservative: {
      preferredOddsRange: [1.30, 1.80],
      maxPredictionsPerDay: 2,
      riskTolerance: 'low',
      betTypes: ['match_result', 'double_chance'],
      stakeRecommendation: 2, // 2% do bankroll
      multipleStrategy: 'avoid',
    },
    balanced: {
      preferredOddsRange: [1.60, 2.50],
      maxPredictionsPerDay: 4,
      riskTolerance: 'medium',
      betTypes: ['match_result', 'over_under', 'both_score'],
      stakeRecommendation: 3, // 3% do bankroll
      multipleStrategy: 'occasional',
    },
    highRisk: {
      preferredOddsRange: [2.50, 5.00],
      maxPredictionsPerDay: 6,
      riskTolerance: 'high',
      betTypes: ['handicap', 'correct_score', 'multiple'],
      stakeRecommendation: 5, // 5% do bankroll
      multipleStrategy: 'frequent',
    },
    strategic: {
      preferredOddsRange: [1.70, 2.80],
      maxPredictionsPerDay: 3,
      riskTolerance: 'medium',
      betTypes: ['match_result', 'over_under', 'handicap', 'value_bets'],
      stakeRecommendation: 3, // 3% do bankroll
      multipleStrategy: 'occasional',
    },
    recreational: {
      preferredOddsRange: [1.50, 3.50],
      maxPredictionsPerDay: 5,
      riskTolerance: 'medium',
      betTypes: ['match_result', 'both_score', 'first_goal'],
      stakeRecommendation: 2, // 2% do bankroll
      multipleStrategy: 'frequent',
    },
  };

  return strategies[style];
}

/**
 * Filtra recomendações baseadas no estilo do usuário
 */
export function filterRecommendationsByStyle(
  recommendations: SmartRecommendation[],
  style: BettorStyle
): SmartRecommendation[] {
  const strategy = getPersonalizedStrategy(style);
  const [minOdds, maxOdds] = strategy.preferredOddsRange;

  return recommendations.filter((rec) => {
    // Filtrar por odds
    const oddsMatch = rec.odds >= minOdds && rec.odds <= maxOdds;

    // Filtrar por nível de risco
    const riskMatch =
      (strategy.riskTolerance === 'low' && rec.level === 'conservative') ||
      (strategy.riskTolerance === 'medium' && rec.level !== 'highRisk') ||
      strategy.riskTolerance === 'high';

    return oddsMatch && riskMatch;
  });
}

/**
 * Ajusta recomendação para o estilo do usuário
 */
export function personalizeRecommendation(
  recommendation: SmartRecommendation,
  style: BettorStyle,
  bankroll: number
): {
  recommendation: SmartRecommendation;
  stake: number;
  potentialReturn: number;
  personalizedAdvice: string;
} {
  const strategy = getPersonalizedStrategy(style);
  const stake = (bankroll * strategy.stakeRecommendation) / 100;
  const potentialReturn = stake * recommendation.odds;

  let personalizedAdvice = '';

  switch (style) {
    case 'conservative':
      personalizedAdvice = `Como apostador conservador, recomendamos odds baixas (${recommendation.odds}) com alta confiança (${recommendation.confidence}%). Aposte apenas ${strategy.stakeRecommendation}% do seu bankroll para minimizar riscos.`;
      break;
    case 'balanced':
      personalizedAdvice = `Seu perfil equilibrado permite odds médias (${recommendation.odds}) com boa relação risco/retorno. Stake de ${strategy.stakeRecommendation}% mantém seu bankroll saudável.`;
      break;
    case 'highRisk':
      personalizedAdvice = `Para seu perfil agressivo, esta odd de ${recommendation.odds} oferece alto potencial de retorno. Considere múltiplas para maximizar ganhos, mas não ultrapasse ${strategy.stakeRecommendation}% do bankroll.`;
      break;
    case 'strategic':
      personalizedAdvice = `Análise estratégica indica valor esperado positivo (${recommendation.expectedValue}%). Odds de ${recommendation.odds} estão dentro da sua faixa ideal. Aposte ${strategy.stakeRecommendation}% com disciplina.`;
      break;
    case 'recreational':
      personalizedAdvice = `Para diversão responsável, esta aposta oferece odds interessantes (${recommendation.odds}). Aposte ${strategy.stakeRecommendation}% e aproveite o jogo!`;
      break;
  }

  return {
    recommendation,
    stake: Math.round(stake * 100) / 100,
    potentialReturn: Math.round(potentialReturn * 100) / 100,
    personalizedAdvice,
  };
}

/**
 * Gera sugestão de múltipla baseada no estilo
 */
export function generateMultipleSuggestion(
  style: BettorStyle,
  availableMatches: Array<{ match: string; odds: number; confidence: number }>
): {
  matches: typeof availableMatches;
  combinedOdds: number;
  combinedConfidence: number;
  advice: string;
} | null {
  const strategy = getPersonalizedStrategy(style);

  // Conservadores devem evitar múltiplas
  if (strategy.multipleStrategy === 'avoid') {
    return null;
  }

  // Selecionar número de jogos baseado no estilo
  const numMatches = strategy.multipleStrategy === 'occasional' ? 2 : 3;
  
  // Ordenar por confiança e pegar os melhores
  const selectedMatches = availableMatches
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, numMatches);

  if (selectedMatches.length < numMatches) {
    return null;
  }

  // Calcular odds combinadas
  const combinedOdds = selectedMatches.reduce((acc, m) => acc * m.odds, 1);
  
  // Calcular confiança combinada (diminui com mais jogos)
  const avgConfidence = selectedMatches.reduce((acc, m) => acc + m.confidence, 0) / selectedMatches.length;
  const combinedConfidence = avgConfidence * Math.pow(0.85, numMatches - 1);

  let advice = '';
  if (style === 'highRisk') {
    advice = `Múltipla agressiva com ${numMatches} jogos. Odds combinadas de ${combinedOdds.toFixed(2)} oferecem alto retorno. Risco elevado, mas compatível com seu perfil.`;
  } else if (style === 'balanced' || style === 'recreational') {
    advice = `Múltipla moderada com ${numMatches} seleções de alta confiança. Odds de ${combinedOdds.toFixed(2)} equilibram risco e retorno.`;
  } else {
    advice = `Múltipla estratégica com ${numMatches} jogos cuidadosamente selecionados. Confiança combinada de ${combinedConfidence.toFixed(1)}%.`;
  }

  return {
    matches: selectedMatches,
    combinedOdds: Math.round(combinedOdds * 100) / 100,
    combinedConfidence: Math.round(combinedConfidence),
    advice,
  };
}

/**
 * Calcula stake ideal usando critério de Kelly
 */
export function calculateKellyStake(
  probability: number,
  odds: number,
  bankroll: number,
  style: BettorStyle
): number {
  // Fórmula de Kelly: (bp - q) / b
  // b = odds - 1, p = probabilidade, q = 1 - p
  const p = probability / 100;
  const q = 1 - p;
  const b = odds - 1;

  let kellyFraction = (b * p - q) / b;

  // Aplicar fração de Kelly baseada no estilo
  const kellyMultiplier: Record<BettorStyle, number> = {
    conservative: 0.25, // 1/4 Kelly
    balanced: 0.5, // 1/2 Kelly
    highRisk: 0.75, // 3/4 Kelly
    strategic: 0.5, // 1/2 Kelly
    recreational: 0.33, // 1/3 Kelly
  };

  kellyFraction *= kellyMultiplier[style];

  // Garantir que não ultrapasse limites do estilo
  const strategy = getPersonalizedStrategy(style);
  const maxStake = (bankroll * strategy.stakeRecommendation) / 100;

  const stake = Math.min(bankroll * kellyFraction, maxStake);

  return Math.max(0, Math.round(stake * 100) / 100);
}

/**
 * Gera insights personalizados para o usuário
 */
export function generatePersonalizedInsights(
  style: BettorStyle,
  recentPerformance: {
    wins: number;
    losses: number;
    avgOdds: number;
    totalProfit: number;
  }
): string[] {
  const insights: string[] = [];
  const winRate = (recentPerformance.wins / (recentPerformance.wins + recentPerformance.losses)) * 100;

  // Insights baseados no estilo
  switch (style) {
    case 'conservative':
      if (winRate > 70) {
        insights.push('Excelente! Seu perfil conservador está gerando resultados consistentes.');
      } else if (winRate < 60) {
        insights.push('Considere focar em odds ainda mais baixas (1.30-1.60) para aumentar sua taxa de acerto.');
      }
      if (recentPerformance.avgOdds > 2.0) {
        insights.push('Suas odds médias estão acima do ideal para perfil conservador. Reduza o risco.');
      }
      break;

    case 'balanced':
      if (winRate > 60) {
        insights.push('Ótimo equilíbrio! Continue mantendo a disciplina.');
      }
      if (recentPerformance.totalProfit > 0) {
        insights.push('Seu perfil equilibrado está gerando lucro consistente. Mantenha a estratégia.');
      } else {
        insights.push('Revise suas apostas. Talvez seja hora de ser mais seletivo nas escolhas.');
      }
      break;

    case 'highRisk':
      if (winRate > 50) {
        insights.push('Excelente gestão de risco! Suas apostas agressivas estão compensando.');
      } else {
        insights.push('Taxa de acerto baixa. Considere reduzir o número de múltiplas e focar em singles de valor.');
      }
      if (recentPerformance.totalProfit < 0) {
        insights.push('⚠️ Bankroll em risco. Reduza stakes temporariamente para 2-3% até recuperar.');
      }
      break;

    case 'strategic':
      insights.push('Continue buscando value bets. Seu perfil analítico é ideal para longo prazo.');
      if (recentPerformance.avgOdds < 1.8) {
        insights.push('Suas odds estão conservadoras demais. Busque mais oportunidades de valor (1.80-2.50).');
      }
      break;

    case 'recreational':
      insights.push('Lembre-se: aposte apenas o que pode perder. Diversão em primeiro lugar!');
      if (recentPerformance.totalProfit < -100) {
        insights.push('⚠️ Perdas acumuladas. Considere fazer uma pausa ou reduzir stakes.');
      }
      break;
  }

  // Insights gerais
  if (winRate < 50) {
    insights.push('📉 Taxa de acerto abaixo de 50%. Revise sua estratégia e seja mais seletivo.');
  }

  if (recentPerformance.wins + recentPerformance.losses > 20) {
    insights.push('Você está ativo! Lembre-se de fazer pausas e não apostar por impulso.');
  }

  return insights;
}
