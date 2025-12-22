// ============================================
// MÓDULO PRINCIPAL DE IA DO PRIMEBETS AI
// ============================================

/**
 * Este é o módulo central que integra todas as funcionalidades de IA:
 * 
 * 1. IA para Palpites Inteligentes (predictions.ts)
 * 2. IA Personalizada por Estilo (personalization.ts)
 * 3. IA do Comparador de Plataformas (platform-comparison.ts)
 * 4. IA de Aconselhamento (advisory.ts)
 * 5. IA de Alertas (alerts.ts)
 */

import { BettorStyle } from '../types';
import {
  generateProbabilities,
  generateRecommendations,
  generateMockStatistics,
  type MatchStatistics,
  type SmartRecommendation,
} from './predictions';

import {
  getPersonalizedStrategy,
  filterRecommendationsByStyle,
  personalizeRecommendation,
  generateMultipleSuggestion,
  calculateKellyStake,
  generatePersonalizedInsights,
} from './personalization';

import {
  compareMarketOdds,
  generatePlatformRanking,
  findValueOpportunities,
  recommendPlatform,
  calculateReturnComparison,
  detectOddsMovement,
  type MarketComparison,
  type PlatformRanking,
} from './platform-comparison';

import {
  generateDailyAdvice,
  analyzeMarketConditions,
  generateContextualMessage,
  generateRiskAlert,
  getTimeBasedAdvice,
  getWeekdayAdvice,
  type DailyAdvice,
} from './advisory';

import {
  monitorOddsChanges,
  generateMatchStartingAlerts,
  generateRecommendedEntryAlerts,
  generateValueOpportunityAlerts,
  generateRiskWarningAlerts,
  alertSystem,
  setupAutomaticAlertMonitoring,
  generateDailyAlertSummary,
  type Alert,
} from './alerts';

// ============================================
// INTERFACE PRINCIPAL DA IA
// ============================================

export interface AIAnalysisRequest {
  userId: string;
  userStyle: BettorStyle;
  bankroll: number;
  match: {
    homeTeam: string;
    awayTeam: string;
    sport: string;
    market: string;
  };
  statistics?: MatchStatistics;
}

export interface AIAnalysisResponse {
  // Probabilidades calculadas
  probabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
    confidence: number;
  };

  // Recomendações em 3 níveis
  recommendations: {
    conservative: SmartRecommendation;
    balanced: SmartRecommendation;
    highRisk: SmartRecommendation;
  };

  // Recomendação personalizada para o usuário
  personalizedRecommendation: {
    recommendation: SmartRecommendation;
    stake: number;
    potentialReturn: number;
    advice: string;
  };

  // Insights e conselhos
  advice: {
    mainMessage: string;
    tips: string[];
    warnings: string[];
  };

  // Alertas ativos
  alerts: Alert[];
}

/**
 * FUNÇÃO PRINCIPAL: Gera análise completa com IA
 */
export async function generateCompleteAIAnalysis(
  request: AIAnalysisRequest
): Promise<AIAnalysisResponse> {
  // 1. Obter ou gerar estatísticas
  const stats = request.statistics || generateMockStatistics(
    request.match.homeTeam,
    request.match.awayTeam
  );

  // 2. Calcular probabilidades com IA
  const probabilities = generateProbabilities(stats);

  // 3. Gerar recomendações em 3 níveis
  const allRecommendations = generateRecommendations(stats, probabilities);

  const recommendations = {
    conservative: allRecommendations.find((r) => r.level === 'conservative')!,
    balanced: allRecommendations.find((r) => r.level === 'balanced')!,
    highRisk: allRecommendations.find((r) => r.level === 'highRisk')!,
  };

  // 4. Filtrar e personalizar para o estilo do usuário
  const filteredRecommendations = filterRecommendationsByStyle(
    allRecommendations,
    request.userStyle
  );

  const bestForUser = filteredRecommendations[0] || recommendations.balanced;

  const personalizedRecommendation = personalizeRecommendation(
    bestForUser,
    request.userStyle,
    request.bankroll
  );

  // 5. Gerar conselhos personalizados
  const marketConditions = analyzeMarketConditions();
  const recentPerformance = getUserPerformance(request.userId);
  
  const dailyAdvice = generateDailyAdvice(
    request.userStyle,
    recentPerformance,
    marketConditions
  );

  // 6. Gerar alertas relevantes
  const alerts = generateRelevantAlerts(request.userId, request.userStyle);

  return {
    probabilities,
    recommendations,
    personalizedRecommendation: {
      recommendation: personalizedRecommendation.recommendation,
      stake: personalizedRecommendation.stake,
      potentialReturn: personalizedRecommendation.potentialReturn,
      advice: personalizedRecommendation.personalizedAdvice,
    },
    advice: {
      mainMessage: dailyAdvice.mainMessage,
      tips: dailyAdvice.tips,
      warnings: dailyAdvice.warnings,
    },
    alerts,
  };
}

/**
 * Gera análise rápida (versão simplificada)
 */
export function generateQuickAnalysis(
  homeTeam: string,
  awayTeam: string,
  userStyle: BettorStyle
): {
  prediction: string;
  odds: number;
  confidence: number;
  advice: string;
} {
  const stats = generateMockStatistics(homeTeam, awayTeam);
  const probabilities = generateProbabilities(stats);
  const recommendations = generateRecommendations(stats, probabilities);
  
  const filtered = filterRecommendationsByStyle(recommendations, userStyle);
  const best = filtered[0] || recommendations[1];

  return {
    prediction: best.prediction,
    odds: best.odds,
    confidence: best.confidence,
    advice: best.reasoning,
  };
}

/**
 * Obtém performance recente do usuário
 */
function getUserPerformance(userId: string): {
  wins: number;
  losses: number;
  streak: number;
  totalProfit: number;
} {
  const stored = localStorage.getItem(`performance_${userId}`);
  
  if (!stored) {
    return { wins: 0, losses: 0, streak: 0, totalProfit: 0 };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { wins: 0, losses: 0, streak: 0, totalProfit: 0 };
  }
}

/**
 * Gera alertas relevantes para o usuário
 */
function generateRelevantAlerts(userId: string, style: BettorStyle): Alert[] {
  const alerts: Alert[] = [];

  // Alertas de risco
  const userBehavior = {
    betsLast24h: 3,
    totalStakeLast24h: 150,
    bankroll: 1000,
    losingStreak: 0,
  };

  const riskAlerts = generateRiskWarningAlerts(userBehavior);
  alerts.push(...riskAlerts);

  // Alertas de oportunidades
  const opportunities = [
    {
      id: '1',
      match: 'Flamengo vs Palmeiras',
      market: 'Vitória Casa',
      odds: 1.85,
      confidence: 78,
      reasoning: 'Flamengo tem 80% de aproveitamento em casa',
    },
  ];

  const entryAlerts = generateRecommendedEntryAlerts(style, opportunities);
  alerts.push(...entryAlerts);

  return alerts;
}

// ============================================
// EXPORTAÇÕES PÚBLICAS
// ============================================

export {
  // Predictions
  generateProbabilities,
  generateRecommendations,
  generateMockStatistics,

  // Personalization
  getPersonalizedStrategy,
  filterRecommendationsByStyle,
  personalizeRecommendation,
  generateMultipleSuggestion,
  calculateKellyStake,
  generatePersonalizedInsights,

  // Platform Comparison
  compareMarketOdds,
  generatePlatformRanking,
  findValueOpportunities,
  recommendPlatform,
  calculateReturnComparison,
  detectOddsMovement,

  // Advisory
  generateDailyAdvice,
  analyzeMarketConditions,
  generateContextualMessage,
  generateRiskAlert,
  getTimeBasedAdvice,
  getWeekdayAdvice,

  // Alerts
  monitorOddsChanges,
  generateMatchStartingAlerts,
  generateRecommendedEntryAlerts,
  generateValueOpportunityAlerts,
  generateRiskWarningAlerts,
  alertSystem,
  setupAutomaticAlertMonitoring,
  generateDailyAlertSummary,
};

// Exportar tipos
export type {
  MatchStatistics,
  SmartRecommendation,
  MarketComparison,
  PlatformRanking,
  DailyAdvice,
  Alert,
};
