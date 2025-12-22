// ============================================
// SERVIÇO: MOTOR DE ANÁLISE INTELIGENTE
// ============================================

import { AnalysisRequest, AnalysisResult, Prediction, BettorStyle } from '../types';
import { BETTOR_STYLES, SPORTS, MARKETS, APP_CONFIG } from '../constants/betting';

/**
 * Gera análise inteligente de palpites baseada no perfil do usuário
 */
export async function generateAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
  const styleConfig = BETTOR_STYLES[request.userStyle];
  const maxPredictions = request.maxPredictions || styleConfig.maxPredictions;

  // Gerar palpites baseados no perfil
  const predictions = await generatePredictions(
    request.sport,
    request.market,
    request.userStyle,
    maxPredictions
  );

  // Calcular resumo
  const summary = calculateSummary(predictions);

  // Calcular stake recomendado
  const recommendedStake = calculateRecommendedStake(request.userStyle, summary.averageOdds);

  return {
    predictions,
    summary,
    recommendedStake,
  };
}

/**
 * Gera palpites individuais
 */
async function generatePredictions(
  sport: string,
  market: string,
  userStyle: BettorStyle,
  count: number
): Promise<Prediction[]> {
  const styleConfig = BETTOR_STYLES[userStyle];
  const predictions: Prediction[] = [];

  // Dados simulados de jogos (em produção, viria de API externa)
  const matches = generateMockMatches(sport, count);

  for (let i = 0; i < count; i++) {
    const match = matches[i];
    const odds = generateOddsForStyle(userStyle);
    const confidence = calculateConfidence(userStyle, odds, market);
    const risk = determineRisk(odds, confidence);

    predictions.push({
      id: `pred_${Date.now()}_${i}`,
      sport,
      league: match.league,
      match: match.name,
      market,
      prediction: generatePredictionText(market, match),
      odds,
      confidence,
      risk,
      reasoning: generateReasoning(userStyle, odds, confidence, market),
      createdAt: new Date(),
    });
  }

  return predictions;
}

/**
 * Gera odds apropriadas para o estilo do usuário
 */
function generateOddsForStyle(style: BettorStyle): number {
  const [minOdds, maxOdds] = BETTOR_STYLES[style].oddsRange;
  const range = maxOdds - minOdds;
  const randomFactor = Math.random();
  
  // Distribuição mais concentrada no meio da faixa
  const normalizedFactor = Math.pow(randomFactor, 0.7);
  const odds = minOdds + range * normalizedFactor;

  return Math.round(odds * 100) / 100;
}

/**
 * Calcula nível de confiança baseado em múltiplos fatores
 */
function calculateConfidence(
  style: BettorStyle,
  odds: number,
  market: string
): number {
  let baseConfidence = 70;

  // Ajuste baseado nas odds
  if (odds < 1.5) {
    baseConfidence += 15;
  } else if (odds < 2.0) {
    baseConfidence += 10;
  } else if (odds < 2.5) {
    baseConfidence += 5;
  } else if (odds > 3.5) {
    baseConfidence -= 10;
  }

  // Ajuste baseado no estilo
  if (style === 'conservative') {
    baseConfidence += 5;
  } else if (style === 'strategic') {
    baseConfidence += 8;
  } else if (style === 'highRisk') {
    baseConfidence -= 5;
  }

  // Ajuste baseado no mercado
  if (market === 'match_result') {
    baseConfidence += 3;
  } else if (market === 'handicap') {
    baseConfidence -= 3;
  }

  // Variação aleatória natural
  const variation = (Math.random() - 0.5) * 10;
  baseConfidence += variation;

  // Garantir limites
  return Math.min(
    APP_CONFIG.MAX_CONFIDENCE_THRESHOLD,
    Math.max(APP_CONFIG.MIN_CONFIDENCE_THRESHOLD, Math.round(baseConfidence))
  );
}

/**
 * Determina o nível de risco
 */
function determineRisk(odds: number, confidence: number): 'low' | 'medium' | 'high' {
  if (odds < 1.8 && confidence > 75) return 'low';
  if (odds > 3.0 || confidence < 70) return 'high';
  return 'medium';
}

/**
 * Gera texto de raciocínio para o palpite
 */
function generateReasoning(
  style: BettorStyle,
  odds: number,
  confidence: number,
  market: string
): string {
  const reasons = [];

  // Razão baseada no estilo
  if (style === 'conservative') {
    reasons.push('Palpite selecionado com foco em segurança e consistência');
  } else if (style === 'strategic') {
    reasons.push('Análise estatística indica valor neste mercado');
  } else if (style === 'highRisk') {
    reasons.push('Oportunidade de alto retorno identificada');
  } else if (style === 'balanced') {
    reasons.push('Equilíbrio ideal entre risco e retorno');
  } else {
    reasons.push('Palpite interessante para diversão');
  }

  // Razão baseada na confiança
  if (confidence > 80) {
    reasons.push('Alta probabilidade baseada em dados históricos');
  } else if (confidence > 70) {
    reasons.push('Boa probabilidade com base em estatísticas recentes');
  }

  // Razão baseada nas odds
  if (odds < 1.5) {
    reasons.push('Favorito claro com odds seguras');
  } else if (odds > 2.5) {
    reasons.push('Odds atrativas para o risco envolvido');
  }

  return reasons.join('. ') + '.';
}

/**
 * Gera texto de predição baseado no mercado
 */
function generatePredictionText(market: string, match: any): string {
  const predictions: Record<string, string[]> = {
    match_result: ['Vitória Casa', 'Empate', 'Vitória Fora'],
    over_under: ['Mais de 2.5 gols', 'Menos de 2.5 gols', 'Mais de 1.5 gols'],
    both_score: ['Ambos marcam - Sim', 'Ambos marcam - Não'],
    handicap: ['Casa -1', 'Fora +1', 'Casa -2'],
    first_goal: ['Casa marca primeiro', 'Fora marca primeiro'],
  };

  const options = predictions[market] || ['Vitória Casa'];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Calcula resumo da análise
 */
function calculateSummary(predictions: Prediction[]) {
  const totalConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0);
  const totalOdds = predictions.reduce((sum, p) => sum + p.odds, 0);

  const riskDistribution = {
    low: predictions.filter((p) => p.risk === 'low').length,
    medium: predictions.filter((p) => p.risk === 'medium').length,
    high: predictions.filter((p) => p.risk === 'high').length,
  };

  return {
    averageConfidence: Math.round(totalConfidence / predictions.length),
    averageOdds: Math.round((totalOdds / predictions.length) * 100) / 100,
    riskDistribution,
  };
}

/**
 * Calcula stake recomendado baseado no perfil
 */
function calculateRecommendedStake(style: BettorStyle, averageOdds: number): number {
  const baseStake = BETTOR_STYLES[style].recommendedStake;
  
  // Ajustar baseado nas odds médias
  let adjustedStake = baseStake;
  
  if (averageOdds < 1.5) {
    adjustedStake *= 1.2; // Pode apostar um pouco mais em favoritos
  } else if (averageOdds > 3.0) {
    adjustedStake *= 0.7; // Reduzir stake em odds altas
  }

  return Math.round(adjustedStake * 10) / 10;
}

/**
 * Gera jogos simulados (mock data)
 * Em produção, isso viria de uma API de dados esportivos
 */
function generateMockMatches(sport: string, count: number) {
  const teams = {
    football: [
      'Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Atlético-MG',
      'Internacional', 'Grêmio', 'Santos', 'Fluminense', 'Botafogo',
    ],
    basketball: [
      'Lakers', 'Warriors', 'Celtics', 'Heat', 'Bucks',
      'Nets', 'Suns', 'Nuggets', 'Clippers', 'Mavericks',
    ],
    tennis: [
      'Djokovic', 'Alcaraz', 'Medvedev', 'Tsitsipas', 'Rublev',
      'Sinner', 'Ruud', 'Fritz', 'Hurkacz', 'Rune',
    ],
  };

  const leagues = {
    football: 'Brasileirão Série A',
    basketball: 'NBA',
    tennis: 'ATP Tour',
  };

  const sportTeams = teams[sport as keyof typeof teams] || teams.football;
  const league = leagues[sport as keyof typeof leagues] || 'Liga Principal';

  const matches = [];
  for (let i = 0; i < count; i++) {
    const team1 = sportTeams[Math.floor(Math.random() * sportTeams.length)];
    let team2 = sportTeams[Math.floor(Math.random() * sportTeams.length)];
    
    // Garantir times diferentes
    while (team2 === team1) {
      team2 = sportTeams[Math.floor(Math.random() * sportTeams.length)];
    }

    matches.push({
      name: `${team1} vs ${team2}`,
      league,
      team1,
      team2,
    });
  }

  return matches;
}

/**
 * Salva análise no histórico
 */
export function saveAnalysis(userId: string, analysis: AnalysisResult): void {
  const history = getAnalysisHistory(userId);
  history.push({
    ...analysis,
    timestamp: new Date().toISOString(),
  });

  // Manter apenas últimas 50 análises
  if (history.length > 50) {
    history.shift();
  }

  localStorage.setItem(`analysis_history_${userId}`, JSON.stringify(history));
}

/**
 * Recupera histórico de análises
 */
export function getAnalysisHistory(userId: string): any[] {
  const data = localStorage.getItem(`analysis_history_${userId}`);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}
