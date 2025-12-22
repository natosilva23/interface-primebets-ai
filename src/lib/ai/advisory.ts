// ============================================
// IA DE ACONSELHAMENTO PERSONALIZADO
// ============================================

import { BettorStyle } from '../types';

export interface DailyAdvice {
  date: Date;
  mainMessage: string;
  tips: string[];
  warnings: string[];
  marketInsights: string[];
  motivational: string;
}

export interface MarketCondition {
  market: string;
  predictability: 'low' | 'medium' | 'high';
  volatility: 'low' | 'medium' | 'high';
  recommendation: 'avoid' | 'caution' | 'favorable';
  reasoning: string;
}

/**
 * Gera aconselhamento diário personalizado
 */
export function generateDailyAdvice(
  style: BettorStyle,
  recentPerformance: {
    wins: number;
    losses: number;
    streak: number;
    totalProfit: number;
  },
  marketConditions: MarketCondition[]
): DailyAdvice {
  const tips: string[] = [];
  const warnings: string[] = [];
  const marketInsights: string[] = [];

  // Análise de performance recente
  const winRate = (recentPerformance.wins / (recentPerformance.wins + recentPerformance.losses)) * 100;
  
  // Mensagem principal baseada no estilo e performance
  let mainMessage = '';
  
  if (recentPerformance.streak > 3) {
    mainMessage = '🔥 Você está em boa fase! Mantenha a disciplina e não aumente stakes impulsivamente.';
    warnings.push('Cuidado com excesso de confiança. Mantenha sua estratégia mesmo em sequências positivas.');
  } else if (recentPerformance.streak < -3) {
    mainMessage = '⚠️ Sequência negativa detectada. Hora de revisar estratégia e possivelmente reduzir stakes.';
    warnings.push('Evite "correr atrás do prejuízo". Faça uma pausa se necessário.');
    tips.push('Volte ao básico: aposte apenas em jogos que você realmente analisou.');
  } else {
    mainMessage = '📊 Desempenho estável. Continue seguindo sua estratégia com disciplina.';
  }

  // Dicas baseadas no estilo
  switch (style) {
    case 'conservative':
      tips.push('Foque em favoritos claros com odds entre 1.30-1.80.');
      tips.push('Evite múltiplas. Singles são mais seguros para seu perfil.');
      if (winRate < 70) {
        warnings.push('Sua taxa de acerto está abaixo do esperado para perfil conservador. Seja ainda mais seletivo.');
      }
      break;

    case 'balanced':
      tips.push('Busque equilíbrio entre odds atrativas (1.80-2.50) e confiança.');
      tips.push('Múltiplas ocasionais de 2 jogos podem aumentar retorno sem muito risco.');
      break;

    case 'highRisk':
      tips.push('Suas múltiplas devem ter no máximo 3-4 seleções para manter viabilidade.');
      warnings.push('Não ultrapasse 5% do bankroll por aposta, mesmo em odds altas.');
      if (recentPerformance.totalProfit < 0) {
        warnings.push('⚠️ Bankroll em risco! Reduza temporariamente para 2-3% até recuperar.');
      }
      break;

    case 'strategic':
      tips.push('Busque value bets onde odds estão acima da probabilidade real.');
      tips.push('Analise estatísticas antes de apostar. Seu perfil se beneficia de pesquisa.');
      marketInsights.push('Compare odds entre plataformas para maximizar valor.');
      break;

    case 'recreational':
      tips.push('Lembre-se: aposte apenas o que pode perder sem afetar seu orçamento.');
      tips.push('Diversão é prioridade. Não persiga perdas.');
      break;
  }

  // Insights de mercado
  marketConditions.forEach((condition) => {
    if (condition.recommendation === 'avoid') {
      warnings.push(`Evite ${condition.market} hoje: ${condition.reasoning}`);
    } else if (condition.recommendation === 'favorable') {
      marketInsights.push(`✅ ${condition.market} está favorável: ${condition.reasoning}`);
    } else {
      marketInsights.push(`⚠️ ${condition.market} requer cautela: ${condition.reasoning}`);
    }
  });

  // Mensagem motivacional
  let motivational = '';
  if (recentPerformance.totalProfit > 0) {
    motivational = '💪 Continue assim! Disciplina e paciência são chaves para o sucesso a longo prazo.';
  } else if (recentPerformance.totalProfit < -50) {
    motivational = '🎯 Todo apostador passa por fases ruins. O importante é manter a cabeça fria e seguir o plano.';
  } else {
    motivational = '📈 Apostas esportivas são uma maratona, não uma corrida. Foque no longo prazo.';
  }

  return {
    date: new Date(),
    mainMessage,
    tips,
    warnings,
    marketInsights,
    motivational,
  };
}

/**
 * Analisa condições de mercado do dia
 */
export function analyzeMarketConditions(): MarketCondition[] {
  // Em produção, isso analisaria dados reais de APIs
  // Aqui simulamos condições baseadas em padrões comuns
  
  const conditions: MarketCondition[] = [];

  // Análise de múltiplas
  const multiplesPredictability = Math.random();
  if (multiplesPredictability < 0.3) {
    conditions.push({
      market: 'Múltiplas',
      predictability: 'low',
      volatility: 'high',
      recommendation: 'avoid',
      reasoning: 'Muitos jogos imprevisíveis hoje. Favoritos não estão performando bem.',
    });
  } else if (multiplesPredictability > 0.7) {
    conditions.push({
      market: 'Múltiplas',
      predictability: 'high',
      volatility: 'low',
      recommendation: 'favorable',
      reasoning: 'Rodada com favoritos claros. Bom momento para múltiplas conservadoras.',
    });
  }

  // Análise de escanteios
  const cornersPredictability = Math.random();
  if (cornersPredictability > 0.6) {
    conditions.push({
      market: 'Escanteios',
      predictability: 'high',
      volatility: 'low',
      recommendation: 'favorable',
      reasoning: 'Estatísticas de escanteios muito consistentes nas últimas rodadas.',
    });
  }

  // Análise de gols
  const goalsPredictability = Math.random();
  if (goalsPredictability < 0.4) {
    conditions.push({
      market: 'Total de Gols',
      predictability: 'low',
      volatility: 'high',
      recommendation: 'caution',
      reasoning: 'Jogos com muita variação de gols. Difícil prever over/under com confiança.',
    });
  } else {
    conditions.push({
      market: 'Total de Gols',
      predictability: 'medium',
      volatility: 'medium',
      recommendation: 'favorable',
      reasoning: 'Padrões de gols estáveis. Analise médias de cada time.',
    });
  }

  // Análise de handicap
  conditions.push({
    market: 'Handicap Asiático',
    predictability: 'medium',
    volatility: 'medium',
    recommendation: 'caution',
    reasoning: 'Requer análise técnica profunda. Recomendado apenas para apostadores experientes.',
  });

  return conditions;
}

/**
 * Gera mensagem contextual baseada em situação específica
 */
export function generateContextualMessage(context: {
  situation: 'pre_match' | 'live' | 'post_match' | 'losing_streak' | 'winning_streak';
  style: BettorStyle;
  additionalData?: any;
}): string {
  const { situation, style, additionalData } = context;

  switch (situation) {
    case 'pre_match':
      if (style === 'conservative') {
        return '🎯 Analise bem antes de apostar. Favoritos claros são sua melhor opção.';
      } else if (style === 'highRisk') {
        return '🔥 Odds altas são tentadoras, mas não esqueça da gestão de banca!';
      }
      return '📊 Revise suas análises e aposte com confiança.';

    case 'live':
      return '⚡ Apostas ao vivo exigem decisões rápidas. Não aposte por impulso!';

    case 'post_match':
      if (additionalData?.won) {
        return '🎉 Parabéns! Mas lembre-se: uma vitória não muda sua estratégia de longo prazo.';
      }
      return '😔 Derrota faz parte. Analise o que pode melhorar e siga em frente.';

    case 'losing_streak':
      return '⚠️ Sequência negativa detectada. Considere:\n' +
        '1. Reduzir stakes temporariamente\n' +
        '2. Fazer uma pausa de 24-48h\n' +
        '3. Revisar sua estratégia\n' +
        '4. Não tentar "recuperar" perdas rapidamente';

    case 'winning_streak':
      return '🔥 Sequência positiva! Mas cuidado:\n' +
        '1. Não aumente stakes drasticamente\n' +
        '2. Mantenha a disciplina\n' +
        '3. Não aposte em jogos que não analisou\n' +
        '4. Lembre-se: a sorte também acaba';

    default:
      return '📈 Mantenha a disciplina e siga seu plano de apostas.';
  }
}

/**
 * Gera alerta de comportamento de risco
 */
export function generateRiskAlert(
  recentBets: Array<{ stake: number; odds: number; timestamp: Date }>,
  bankroll: number
): {
  hasAlert: boolean;
  severity: 'low' | 'medium' | 'high';
  message: string;
  recommendations: string[];
} | null {
  const last24h = recentBets.filter(
    (bet) => Date.now() - bet.timestamp.getTime() < 24 * 60 * 60 * 1000
  );

  const recommendations: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';
  let message = '';

  // Verificar número excessivo de apostas
  if (last24h.length > 10) {
    severity = 'high';
    message = '⚠️ ALERTA: Você fez mais de 10 apostas nas últimas 24h. Isso pode indicar apostas impulsivas.';
    recommendations.push('Faça uma pausa de pelo menos 12 horas');
    recommendations.push('Estabeleça um limite diário de apostas (máx 5)');
    recommendations.push('Aposte apenas em jogos que você realmente analisou');
  }

  // Verificar stakes muito altos
  const highStakeBets = last24h.filter((bet) => bet.stake > bankroll * 0.1);
  if (highStakeBets.length > 0) {
    severity = severity === 'high' ? 'high' : 'medium';
    message = message || '⚠️ ALERTA: Você apostou mais de 10% do bankroll em apostas recentes.';
    recommendations.push('Nunca aposte mais de 5% do bankroll em uma única aposta');
    recommendations.push('Revise sua gestão de banca');
  }

  // Verificar odds muito altas (possível perseguição de perdas)
  const highOddsBets = last24h.filter((bet) => bet.odds > 5.0);
  if (highOddsBets.length > 3) {
    severity = 'medium';
    message = message || '⚠️ Você está apostando em odds muito altas com frequência.';
    recommendations.push('Odds altas têm baixa probabilidade. Seja mais seletivo');
    recommendations.push('Foque em apostas de valor, não em odds altas');
  }

  // Verificar apostas em sequência rápida (possível tilt)
  const rapidBets = last24h.filter((bet, index) => {
    if (index === 0) return false;
    const timeDiff = bet.timestamp.getTime() - last24h[index - 1].timestamp.getTime();
    return timeDiff < 5 * 60 * 1000; // Menos de 5 minutos entre apostas
  });

  if (rapidBets.length > 3) {
    severity = 'high';
    message = '🚨 ALERTA CRÍTICO: Você está apostando muito rapidamente. Possível sinal de tilt emocional.';
    recommendations.push('PARE IMEDIATAMENTE de apostar');
    recommendations.push('Faça uma pausa de 24 horas');
    recommendations.push('Respire fundo e não tente recuperar perdas');
  }

  if (message) {
    return {
      hasAlert: true,
      severity,
      message,
      recommendations,
    };
  }

  return null;
}

/**
 * Gera dica baseada em horário do dia
 */
export function getTimeBasedAdvice(): string {
  const hour = new Date().getHours();

  if (hour >= 0 && hour < 6) {
    return '🌙 Apostas de madrugada? Cuidado com decisões impulsivas quando cansado.';
  } else if (hour >= 6 && hour < 12) {
    return '☀️ Bom dia! Analise os jogos do dia com calma antes de apostar.';
  } else if (hour >= 12 && hour < 18) {
    return '🌤️ Boa tarde! Revise suas apostas planejadas e mantenha a disciplina.';
  } else if (hour >= 18 && hour < 22) {
    return '🌆 Horário nobre! Muitos jogos acontecendo. Seja seletivo.';
  } else {
    return '🌃 Fim do dia. Não aposte por impulso nos últimos jogos.';
  }
}

/**
 * Gera conselho baseado em dia da semana
 */
export function getWeekdayAdvice(): string {
  const day = new Date().getDay();

  switch (day) {
    case 0: // Domingo
      return '⚽ Domingo tem muitos jogos! Não tente apostar em todos. Seja seletivo.';
    case 1: // Segunda
      return '📊 Início da semana. Bom momento para planejar suas apostas.';
    case 2: // Terça
    case 3: // Quarta
      return '🏆 Meio de semana com copas europeias. Analise bem os confrontos.';
    case 4: // Quinta
      return '📈 Quinta-feira. Revise seu desempenho semanal antes do fim de semana.';
    case 5: // Sexta
      return '🎯 Sexta-feira! Fim de semana chegando com muitos jogos. Planeje bem.';
    case 6: // Sábado
      return '🔥 Sábado é dia de grandes jogos! Mas não aposte em todos.';
    default:
      return '📊 Mantenha a disciplina todos os dias da semana.';
  }
}
