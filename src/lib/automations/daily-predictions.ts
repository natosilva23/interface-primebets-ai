// ============================================
// AUTOMAÇÃO: NOTIFICAÇÕES DIÁRIAS DE PALPITES
// ============================================

import { generateProbabilities } from '../ai/predictions';
import { createNotification } from '../services/notifications';
import { getUserBySession } from '../services/auth';
import { isPremiumUser } from '../services/premium';

/**
 * Agenda envio diário de palpites (8h da manhã)
 */
export function scheduleDailyPredictions(userId: string): void {
  // Calcular próximo horário de envio (8h)
  const now = new Date();
  const next8AM = new Date();
  next8AM.setHours(8, 0, 0, 0);

  // Se já passou das 8h hoje, agendar para amanhã
  if (now > next8AM) {
    next8AM.setDate(next8AM.getDate() + 1);
  }

  const msUntilNext = next8AM.getTime() - now.getTime();

  // Agendar primeira execução
  setTimeout(() => {
    sendDailyPredictions(userId);

    // Repetir a cada 24 horas
    setInterval(() => {
      sendDailyPredictions(userId);
    }, 24 * 60 * 60 * 1000);
  }, msUntilNext);

  console.log(`📅 Palpites diários agendados para ${next8AM.toLocaleString()}`);
}

/**
 * Envia palpites diários personalizados
 */
async function sendDailyPredictions(userId: string): Promise<void> {
  try {
    const user = await getUserBySession(userId);
    if (!user) return;

    // Gerar palpites baseados no perfil
    const predictions = await generateProbabilities(
      userId,
      user.bettingStyle || 'balanced',
      'football',
      'match_result'
    );

    // Limitar quantidade baseado no plano
    const limit = isPremiumUser(userId) ? 10 : 3;
    const limitedPredictions = predictions.slice(0, limit);

    // Criar notificação
    createNotification(
      userId,
      'newPrediction',
      '🎯 Seus Palpites do Dia Chegaram!',
      `${limitedPredictions.length} palpites personalizados foram gerados para você. Confira agora!`,
      {
        predictions: limitedPredictions,
        count: limitedPredictions.length,
      }
    );

    console.log(`✅ Palpites diários enviados para usuário ${userId}`);
  } catch (error) {
    console.error('❌ Erro ao enviar palpites diários:', error);
  }
}

/**
 * Envia notificação quando odds vantajosas são detectadas
 */
export function notifyAdvantageousOdds(
  userId: string,
  match: string,
  platform: string,
  odds: number
): void {
  // Apenas para usuários premium
  if (!isPremiumUser(userId)) return;

  createNotification(
    userId,
    'advantageousOdds',
    '💎 Odds Vantajosas Detectadas!',
    `${match} - ${platform} está pagando ${odds.toFixed(2)} neste momento!`,
    {
      match,
      platform,
      odds,
      timestamp: new Date().toISOString(),
    }
  );

  console.log(`💎 Notificação de odds vantajosas enviada: ${match} @ ${odds}`);
}

/**
 * Monitora odds em tempo real e notifica oportunidades
 */
export function startOddsMonitoring(userId: string): void {
  // Verificar a cada 15 minutos
  setInterval(() => {
    checkForAdvantageousOdds(userId);
  }, 15 * 60 * 1000);

  console.log('👀 Monitoramento de odds iniciado');
}

/**
 * Verifica se há odds vantajosas disponíveis
 */
async function checkForAdvantageousOdds(userId: string): Promise<void> {
  if (!isPremiumUser(userId)) return;

  // Simular verificação de odds (em produção, consultaria APIs reais)
  const hasOpportunity = Math.random() > 0.7; // 30% de chance

  if (hasOpportunity) {
    const matches = [
      { match: 'Flamengo vs Palmeiras', platform: 'Bet365', odds: 2.85 },
      { match: 'Real Madrid vs Barcelona', platform: 'Betano', odds: 3.20 },
      { match: 'Lakers vs Warriors', platform: '1xBet', odds: 2.95 },
    ];

    const opportunity = matches[Math.floor(Math.random() * matches.length)];
    notifyAdvantageousOdds(
      userId,
      opportunity.match,
      opportunity.platform,
      opportunity.odds
    );
  }
}
