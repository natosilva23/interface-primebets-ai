// ============================================
// SERVIÇO: LÓGICA DO QUESTIONÁRIO
// ============================================

import { QuizAnswer, QuizResult, BettorStyle } from '../types';
import { QUIZ_QUESTIONS, BETTOR_STYLES } from '../constants/betting';

/**
 * Processa as respostas do questionário e determina o estilo do apostador
 */
export function processQuizAnswers(answers: QuizAnswer[]): QuizResult {
  // Validar se todas as perguntas foram respondidas
  if (answers.length !== QUIZ_QUESTIONS.length) {
    throw new Error('Todas as perguntas devem ser respondidas');
  }

  // Calcular pontuação ponderada
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let totalRisk = 0;

  answers.forEach((answer) => {
    const question = QUIZ_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) return;

    const option = question.options.find((opt) => opt.id === answer.optionId);
    if (!option) return;

    totalWeightedScore += option.value * question.weight;
    totalWeight += question.weight;
    totalRisk += option.riskLevel;
  });

  const averageScore = totalWeightedScore / totalWeight;
  const averageRisk = totalRisk / answers.length;

  // Calcular scores para cada estilo
  const scores = {
    conservative: calculateStyleScore(averageScore, averageRisk, 'conservative'),
    balanced: calculateStyleScore(averageScore, averageRisk, 'balanced'),
    highRisk: calculateStyleScore(averageScore, averageRisk, 'highRisk'),
    strategic: calculateStyleScore(averageScore, averageRisk, 'strategic'),
    recreational: calculateStyleScore(averageScore, averageRisk, 'recreational'),
  };

  // Determinar estilo dominante
  const style = determineStyle(scores);

  // Calcular confiança na classificação
  const confidence = calculateConfidence(scores, style);

  return {
    style,
    scores,
    confidence,
  };
}

/**
 * Calcula o score para um estilo específico
 */
function calculateStyleScore(
  averageScore: number,
  averageRisk: number,
  style: BettorStyle
): number {
  const styleConfig = BETTOR_STYLES[style];
  
  let score = 0;

  // Pontuação baseada no nível de risco
  if (style === 'conservative' && averageRisk <= 2) {
    score += 40;
  } else if (style === 'balanced' && averageRisk >= 2 && averageRisk <= 3) {
    score += 40;
  } else if (style === 'highRisk' && averageRisk >= 3) {
    score += 40;
  } else if (style === 'strategic' && averageRisk >= 2 && averageRisk <= 3) {
    score += 35;
  } else if (style === 'recreational') {
    score += 30;
  }

  // Pontuação baseada na média geral
  if (style === 'conservative' && averageScore <= 2) {
    score += 30;
  } else if (style === 'balanced' && averageScore >= 2 && averageScore <= 3) {
    score += 30;
  } else if (style === 'highRisk' && averageScore >= 3) {
    score += 30;
  } else if (style === 'strategic' && averageScore >= 2.5 && averageScore <= 3.5) {
    score += 35;
  } else if (style === 'recreational') {
    score += 25;
  }

  // Pontuação adicional baseada em padrões específicos
  score += Math.random() * 10; // Variação natural

  return Math.min(100, Math.max(0, score));
}

/**
 * Determina o estilo dominante baseado nos scores
 */
function determineStyle(scores: Record<BettorStyle, number>): BettorStyle {
  let maxScore = 0;
  let dominantStyle: BettorStyle = 'balanced';

  (Object.keys(scores) as BettorStyle[]).forEach((style) => {
    if (scores[style] > maxScore) {
      maxScore = scores[style];
      dominantStyle = style;
    }
  });

  return dominantStyle;
}

/**
 * Calcula a confiança na classificação
 */
function calculateConfidence(
  scores: Record<BettorStyle, number>,
  dominantStyle: BettorStyle
): number {
  const dominantScore = scores[dominantStyle];
  const otherScores = (Object.keys(scores) as BettorStyle[])
    .filter((style) => style !== dominantStyle)
    .map((style) => scores[style]);

  const averageOtherScores =
    otherScores.reduce((sum, score) => sum + score, 0) / otherScores.length;

  const difference = dominantScore - averageOtherScores;
  const confidence = Math.min(95, Math.max(60, 60 + difference * 1.5));

  return Math.round(confidence);
}

/**
 * Salva o resultado do questionário no localStorage (temporário)
 * Em produção, isso seria salvo no banco de dados
 */
export function saveQuizResult(userId: string, result: QuizResult): void {
  const data = {
    userId,
    result,
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem(`quiz_result_${userId}`, JSON.stringify(data));
}

/**
 * Recupera o resultado do questionário
 */
export function getQuizResult(userId: string): QuizResult | null {
  const data = localStorage.getItem(`quiz_result_${userId}`);
  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    return parsed.result;
  } catch {
    return null;
  }
}

/**
 * Obtém informações detalhadas sobre um estilo
 */
export function getStyleInfo(style: BettorStyle) {
  return BETTOR_STYLES[style];
}

/**
 * Atualiza o estilo do usuário
 */
export function updateUserStyle(userId: string, style: BettorStyle): void {
  const currentResult = getQuizResult(userId);
  
  if (currentResult) {
    currentResult.style = style;
    saveQuizResult(userId, currentResult);
  }
}
