// ============================================
// IA PARA PALPITES INTELIGENTES
// ============================================

import { BettorStyle } from '../types';

export interface MatchStatistics {
  homeTeam: string;
  awayTeam: string;
  homeWinRate: number; // 0-100
  awayWinRate: number; // 0-100
  drawRate: number; // 0-100
  homeGoalsAvg: number;
  awayGoalsAvg: number;
  homeForm: number[]; // últimos 5 jogos (1=vitória, 0.5=empate, 0=derrota)
  awayForm: number[]; // últimos 5 jogos
  headToHead: {
    homeWins: number;
    awayWins: number;
    draws: number;
  };
  trend: 'home_strong' | 'away_strong' | 'balanced' | 'unpredictable';
}

export interface PredictionProbability {
  homeWin: number; // 0-100
  draw: number; // 0-100
  awayWin: number; // 0-100
  confidence: number; // 0-100
}

export interface SmartRecommendation {
  level: 'conservative' | 'balanced' | 'highRisk';
  prediction: string;
  odds: number;
  confidence: number;
  reasoning: string;
  expectedValue: number;
}

/**
 * IA Principal: Gera probabilidades baseadas em estatísticas
 */
export function generateProbabilities(stats: MatchStatistics): PredictionProbability {
  // Calcular força dos times baseado em múltiplos fatores
  const homeStrength = calculateTeamStrength(
    stats.homeWinRate,
    stats.homeForm,
    stats.homeGoalsAvg,
    true
  );
  
  const awayStrength = calculateTeamStrength(
    stats.awayWinRate,
    stats.awayForm,
    stats.awayGoalsAvg,
    false
  );

  // Ajustar com histórico de confrontos diretos
  const h2hFactor = calculateH2HFactor(stats.headToHead);
  
  // Calcular probabilidades base
  let homeWinProb = homeStrength * 0.6 + h2hFactor.home * 0.4;
  let awayWinProb = awayStrength * 0.6 + h2hFactor.away * 0.4;
  let drawProb = stats.drawRate * 0.5 + (100 - Math.abs(homeStrength - awayStrength)) * 0.3;

  // Normalizar para somar 100%
  const total = homeWinProb + awayWinProb + drawProb;
  homeWinProb = (homeWinProb / total) * 100;
  awayWinProb = (awayWinProb / total) * 100;
  drawProb = (drawProb / total) * 100;

  // Calcular confiança baseada na consistência dos dados
  const confidence = calculateConfidence(stats, homeWinProb, awayWinProb, drawProb);

  return {
    homeWin: Math.round(homeWinProb * 10) / 10,
    draw: Math.round(drawProb * 10) / 10,
    awayWin: Math.round(awayWinProb * 10) / 10,
    confidence: Math.round(confidence),
  };
}

/**
 * Calcula força do time baseado em múltiplos fatores
 */
function calculateTeamStrength(
  winRate: number,
  form: number[],
  goalsAvg: number,
  isHome: boolean
): number {
  // Forma recente (peso 40%)
  const recentForm = (form.reduce((a, b) => a + b, 0) / form.length) * 100;
  
  // Taxa de vitória (peso 35%)
  const winRateScore = winRate;
  
  // Média de gols (peso 15%)
  const goalsScore = Math.min(goalsAvg * 20, 100);
  
  // Vantagem de jogar em casa (peso 10%)
  const homeAdvantage = isHome ? 10 : 0;

  return (
    recentForm * 0.4 +
    winRateScore * 0.35 +
    goalsScore * 0.15 +
    homeAdvantage * 0.1
  );
}

/**
 * Calcula fator de confronto direto
 */
function calculateH2HFactor(headToHead: MatchStatistics['headToHead']) {
  const total = headToHead.homeWins + headToHead.awayWins + headToHead.draws;
  
  if (total === 0) {
    return { home: 50, away: 50 };
  }

  return {
    home: (headToHead.homeWins / total) * 100,
    away: (headToHead.awayWins / total) * 100,
  };
}

/**
 * Calcula nível de confiança da predição
 */
function calculateConfidence(
  stats: MatchStatistics,
  homeProb: number,
  awayProb: number,
  drawProb: number
): number {
  // Quanto maior a diferença entre as probabilidades, maior a confiança
  const probDiff = Math.max(homeProb, awayProb, drawProb) - Math.min(homeProb, awayProb, drawProb);
  
  // Consistência da forma recente
  const homeFormConsistency = calculateFormConsistency(stats.homeForm);
  const awayFormConsistency = calculateFormConsistency(stats.awayForm);
  const avgConsistency = (homeFormConsistency + awayFormConsistency) / 2;

  // Confiança base
  let confidence = 50;

  // Ajustar pela diferença de probabilidades
  confidence += probDiff * 0.3;

  // Ajustar pela consistência
  confidence += avgConsistency * 0.2;

  // Ajustar pela tendência
  if (stats.trend === 'home_strong' || stats.trend === 'away_strong') {
    confidence += 10;
  } else if (stats.trend === 'unpredictable') {
    confidence -= 15;
  }

  return Math.min(95, Math.max(40, confidence));
}

/**
 * Calcula consistência da forma
 */
function calculateFormConsistency(form: number[]): number {
  if (form.length === 0) return 0;
  
  const avg = form.reduce((a, b) => a + b, 0) / form.length;
  const variance = form.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / form.length;
  
  // Quanto menor a variância, maior a consistência
  return Math.max(0, 100 - variance * 100);
}

/**
 * Gera recomendações em 3 níveis baseadas nas probabilidades
 */
export function generateRecommendations(
  stats: MatchStatistics,
  probabilities: PredictionProbability
): SmartRecommendation[] {
  const recommendations: SmartRecommendation[] = [];

  // Identificar resultado mais provável
  const maxProb = Math.max(probabilities.homeWin, probabilities.draw, probabilities.awayWin);
  let mostLikely: 'home' | 'draw' | 'away';
  
  if (maxProb === probabilities.homeWin) mostLikely = 'home';
  else if (maxProb === probabilities.awayWin) mostLikely = 'away';
  else mostLikely = 'draw';

  // CONSERVADOR: Favorito claro com odds baixas
  if (maxProb > 60) {
    recommendations.push({
      level: 'conservative',
      prediction: mostLikely === 'home' 
        ? `Vitória ${stats.homeTeam}` 
        : mostLikely === 'away' 
        ? `Vitória ${stats.awayTeam}`
        : 'Empate',
      odds: calculateOdds(maxProb * 0.95), // Odds conservadoras
      confidence: probabilities.confidence,
      reasoning: `Favorito claro com ${maxProb.toFixed(1)}% de probabilidade. ${
        mostLikely === 'home' 
          ? `${stats.homeTeam} tem vantagem significativa jogando em casa.`
          : mostLikely === 'away'
          ? `${stats.awayTeam} demonstra superioridade técnica.`
          : 'Equilíbrio histórico entre as equipes sugere empate.'
      }`,
      expectedValue: calculateExpectedValue(maxProb, calculateOdds(maxProb * 0.95)),
    });
  }

  // BALANCEADO: Melhor relação risco/retorno
  const balancedProb = maxProb > 50 ? maxProb : probabilities.homeWin > probabilities.awayWin ? probabilities.homeWin : probabilities.awayWin;
  const balancedOutcome = maxProb > 50 ? mostLikely : probabilities.homeWin > probabilities.awayWin ? 'home' : 'away';
  
  recommendations.push({
    level: 'balanced',
    prediction: balancedOutcome === 'home'
      ? `Vitória ${stats.homeTeam}`
      : balancedOutcome === 'away'
      ? `Vitória ${stats.awayTeam}`
      : 'Empate',
    odds: calculateOdds(balancedProb),
    confidence: Math.round(probabilities.confidence * 0.9),
    reasoning: `Equilíbrio ideal entre risco e retorno. Probabilidade de ${balancedProb.toFixed(1)}% com odds atrativas. ${
      stats.trend === 'balanced' 
        ? 'Jogo equilibrado favorece análise técnica.'
        : 'Tendência recente suporta esta predição.'
    }`,
    expectedValue: calculateExpectedValue(balancedProb, calculateOdds(balancedProb)),
  });

  // ALTO RISCO: Zebra ou múltipla com odds altas
  const underdog = probabilities.homeWin < probabilities.awayWin ? 'home' : 'away';
  const underdogProb = Math.min(probabilities.homeWin, probabilities.awayWin);
  
  if (underdogProb > 20 && underdogProb < 45) {
    recommendations.push({
      level: 'highRisk',
      prediction: underdog === 'home'
        ? `Vitória ${stats.homeTeam} (Zebra)`
        : `Vitória ${stats.awayTeam} (Zebra)`,
      odds: calculateOdds(underdogProb * 0.85), // Odds mais altas
      confidence: Math.round(probabilities.confidence * 0.7),
      reasoning: `Oportunidade de alto retorno. ${
        underdog === 'home'
          ? `${stats.homeTeam} tem ${underdogProb.toFixed(1)}% de chance, mas vantagem de jogar em casa pode surpreender.`
          : `${stats.awayTeam} tem ${underdogProb.toFixed(1)}% de chance e pode aproveitar contra-ataques.`
      } Risco elevado, mas odds compensam.`,
      expectedValue: calculateExpectedValue(underdogProb, calculateOdds(underdogProb * 0.85)),
    });
  } else {
    // Se não há zebra viável, sugerir múltipla
    recommendations.push({
      level: 'highRisk',
      prediction: 'Múltipla: Ambos marcam + Mais de 2.5 gols',
      odds: 3.5,
      confidence: Math.round(probabilities.confidence * 0.6),
      reasoning: `Múltipla agressiva baseada em média de gols. ${stats.homeTeam} marca ${stats.homeGoalsAvg.toFixed(1)} gols/jogo e ${stats.awayTeam} marca ${stats.awayGoalsAvg.toFixed(1)} gols/jogo. Jogo promete ser movimentado.`,
      expectedValue: calculateExpectedValue(35, 3.5),
    });
  }

  return recommendations;
}

/**
 * Calcula odds baseadas na probabilidade
 */
function calculateOdds(probability: number): number {
  // Odds = 100 / probabilidade (com margem da casa de 5%)
  const fairOdds = 100 / probability;
  const oddsWithMargin = fairOdds * 0.95;
  return Math.round(oddsWithMargin * 100) / 100;
}

/**
 * Calcula valor esperado (EV)
 */
function calculateExpectedValue(probability: number, odds: number): number {
  // EV = (probabilidade * odds) - 1
  const ev = ((probability / 100) * odds - 1) * 100;
  return Math.round(ev * 10) / 10;
}

/**
 * Gera estatísticas simuladas para demonstração
 * Em produção, isso viria de APIs de dados esportivos reais
 */
export function generateMockStatistics(homeTeam: string, awayTeam: string): MatchStatistics {
  return {
    homeTeam,
    awayTeam,
    homeWinRate: 50 + Math.random() * 30,
    awayWinRate: 40 + Math.random() * 30,
    drawRate: 20 + Math.random() * 15,
    homeGoalsAvg: 1.2 + Math.random() * 1.5,
    awayGoalsAvg: 1.0 + Math.random() * 1.3,
    homeForm: Array.from({ length: 5 }, () => Math.random() > 0.4 ? 1 : Math.random() > 0.5 ? 0.5 : 0),
    awayForm: Array.from({ length: 5 }, () => Math.random() > 0.5 ? 1 : Math.random() > 0.5 ? 0.5 : 0),
    headToHead: {
      homeWins: Math.floor(Math.random() * 5),
      awayWins: Math.floor(Math.random() * 5),
      draws: Math.floor(Math.random() * 3),
    },
    trend: ['home_strong', 'away_strong', 'balanced', 'unpredictable'][Math.floor(Math.random() * 4)] as any,
  };
}
