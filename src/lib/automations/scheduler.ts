// ============================================
// SCHEDULER CENTRAL DE AUTOMAÇÕES
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ScheduledJob {
  id: string;
  name: string;
  interval: number;
  lastRun: Date | null;
  nextRun: Date;
  enabled: boolean;
  handler: () => Promise<void>;
}

class AutomationScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Registra uma nova automação
   */
  register(
    name: string,
    intervalMs: number,
    handler: () => Promise<void>,
    runImmediately = false
  ): void {
    const job: ScheduledJob = {
      id: `job_${Date.now()}_${Math.random()}`,
      name,
      interval: intervalMs,
      lastRun: null,
      nextRun: new Date(Date.now() + intervalMs),
      enabled: true,
      handler,
    };

    this.jobs.set(name, job);

    if (runImmediately) {
      this.runJob(name);
    }

    this.scheduleJob(name);
    console.log(`✅ Automação registrada: ${name}`);
  }

  /**
   * Agenda execução de um job
   */
  private scheduleJob(name: string): void {
    const job = this.jobs.get(name);
    if (!job || !job.enabled) return;

    const timer = setTimeout(() => {
      this.runJob(name);
      this.scheduleJob(name); // Re-agendar
    }, job.interval);

    this.timers.set(name, timer);
  }

  /**
   * Executa um job
   */
  private async runJob(name: string): Promise<void> {
    const job = this.jobs.get(name);
    if (!job) return;

    try {
      console.log(`🔄 Executando automação: ${name}`);
      await job.handler();
      job.lastRun = new Date();
      job.nextRun = new Date(Date.now() + job.interval);
      console.log(`✅ Automação concluída: ${name}`);
    } catch (error) {
      console.error(`❌ Erro na automação ${name}:`, error);
    }
  }

  /**
   * Para uma automação específica
   */
  stop(name: string): void {
    const timer = this.timers.get(name);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(name);
    }

    const job = this.jobs.get(name);
    if (job) {
      job.enabled = false;
    }

    console.log(`🛑 Automação parada: ${name}`);
  }

  /**
   * Para todas as automações
   */
  stopAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.jobs.forEach((job) => (job.enabled = false));
    console.log('🛑 Todas as automações foram paradas');
  }

  /**
   * Reinicia uma automação
   */
  restart(name: string): void {
    this.stop(name);
    const job = this.jobs.get(name);
    if (job) {
      job.enabled = true;
      this.scheduleJob(name);
      console.log(`🔄 Automação reiniciada: ${name}`);
    }
  }

  /**
   * Lista todas as automações
   */
  list(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Obtém status de uma automação
   */
  getStatus(name: string): ScheduledJob | undefined {
    return this.jobs.get(name);
  }
}

// Instância global do scheduler
export const scheduler = new AutomationScheduler();

/**
 * Inicializa todas as automações do sistema
 */
export async function initializeAllAutomations(): Promise<void> {
  console.log('🚀 Inicializando sistema de automações...');

  // 1. Notificações diárias de palpites (8h da manhã)
  scheduler.register(
    'daily-predictions',
    calculateTimeUntil(8, 0), // 8h
    async () => {
      await sendDailyPredictionsToAllUsers();
    }
  );

  // 2. Atualização de plataformas (a cada 6 horas)
  scheduler.register(
    'platform-updates',
    6 * 60 * 60 * 1000, // 6 horas
    async () => {
      await updateAllPlatforms();
    },
    true // Executar imediatamente
  );

  // 3. Relatórios de performance (segunda-feira 9h)
  scheduler.register(
    'performance-reports',
    calculateTimeUntilMonday(9, 0),
    async () => {
      await sendPerformanceReportsToAllUsers();
    }
  );

  // 4. Verificação de status premium (a cada 1 hora)
  scheduler.register(
    'premium-checks',
    60 * 60 * 1000, // 1 hora
    async () => {
      await checkAllPremiumSubscriptions();
    },
    true // Executar imediatamente
  );

  // 5. Lembretes de renovação (diariamente 10h)
  scheduler.register(
    'renewal-reminders',
    calculateTimeUntil(10, 0), // 10h
    async () => {
      await sendRenewalRemindersToAllUsers();
    }
  );

  // 6. Monitoramento de odds (a cada 15 minutos - premium)
  scheduler.register(
    'odds-monitoring',
    15 * 60 * 1000, // 15 minutos
    async () => {
      await monitorOddsForPremiumUsers();
    }
  );

  console.log('✅ Sistema de automações inicializado com sucesso!');
}

/**
 * Calcula tempo até próximo horário específico
 */
function calculateTimeUntil(hour: number, minute: number): number {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  if (now > target) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

/**
 * Calcula tempo até próxima segunda-feira em horário específico
 */
function calculateTimeUntilMonday(hour: number, minute: number): number {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  target.setDate(target.getDate() + daysUntilMonday);

  return target.getTime() - now.getTime();
}

// ============================================
// HANDLERS DAS AUTOMAÇÕES
// ============================================

/**
 * Envia palpites diários para todos os usuários
 */
async function sendDailyPredictionsToAllUsers(): Promise<void> {
  const { data: users } = await supabase.from('users').select('id, estilo_apostador');

  if (!users) return;

  for (const user of users) {
    try {
      // Gerar palpites personalizados
      const predictions = await generatePredictionsForUser(user.id, user.estilo_apostador);

      // Criar notificação
      await supabase.from('notifications').insert({
        user_id: user.id,
        titulo: '🎯 Seus Palpites do Dia Chegaram!',
        mensagem: `${predictions.length} palpites personalizados foram gerados para você.`,
        lida: false,
        data: new Date().toISOString(),
      });

      console.log(`✅ Palpites enviados para usuário ${user.id}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar palpites para ${user.id}:`, error);
    }
  }
}

/**
 * Atualiza dados de todas as plataformas
 */
async function updateAllPlatforms(): Promise<void> {
  const { data: platforms } = await supabase.from('platforms').select('*');

  if (!platforms) return;

  for (const platform of platforms) {
    try {
      // Simular atualização de odds (em produção, consultaria APIs reais)
      const newOdds = (1.5 + Math.random() * 2).toFixed(2);

      await supabase
        .from('platforms')
        .update({
          odd_media: parseFloat(newOdds),
          ultima_atualizacao: new Date().toISOString(),
        })
        .eq('id', platform.id);

      console.log(`✅ Plataforma ${platform.nome} atualizada`);
    } catch (error) {
      console.error(`❌ Erro ao atualizar ${platform.nome}:`, error);
    }
  }

  // Recalcular ranking
  await recalculatePlatformRanking();
}

/**
 * Recalcula ranking das plataformas
 */
async function recalculatePlatformRanking(): Promise<void> {
  const { data: platforms } = await supabase
    .from('platforms')
    .select('*')
    .order('odd_media', { ascending: false });

  if (!platforms) return;

  for (let i = 0; i < platforms.length; i++) {
    await supabase
      .from('platforms')
      .update({ ranking: i + 1 })
      .eq('id', platforms[i].id);
  }
}

/**
 * Envia relatórios de performance para todos os usuários
 */
async function sendPerformanceReportsToAllUsers(): Promise<void> {
  const { data: users } = await supabase.from('users').select('id');

  if (!users) return;

  for (const user of users) {
    try {
      // Buscar estatísticas do usuário
      const { data: bets } = await supabase
        .from('bets_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('data', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (!bets || bets.length === 0) continue;

      const wins = bets.filter((b) => b.resultado === 'win').length;
      const total = bets.length;
      const winRate = ((wins / total) * 100).toFixed(1);

      // Criar notificação com relatório
      await supabase.from('notifications').insert({
        user_id: user.id,
        titulo: '📊 Seu Relatório Semanal',
        mensagem: `Você teve ${wins} acertos em ${total} apostas (${winRate}% de aproveitamento). Continue assim!`,
        lida: false,
        data: new Date().toISOString(),
      });

      console.log(`✅ Relatório enviado para usuário ${user.id}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar relatório para ${user.id}:`, error);
    }
  }
}

/**
 * Verifica status de todas as assinaturas premium
 */
async function checkAllPremiumSubscriptions(): Promise<void> {
  const { data: subscriptions } = await supabase
    .from('premium_subscriptions')
    .select('*')
    .eq('status', 'active');

  if (!subscriptions) return;

  const now = new Date();

  for (const sub of subscriptions) {
    try {
      const expiresAt = new Date(sub.data_renovacao);

      // Verificar se expirou
      if (now > expiresAt) {
        // Tentar renovação automática
        const renewed = await attemptAutoRenewal(sub.id);

        if (renewed) {
          // Sucesso - notificar usuário
          await supabase.from('notifications').insert({
            user_id: sub.user_id,
            titulo: '✅ Assinatura Renovada',
            mensagem: 'Sua assinatura Premium foi renovada automaticamente!',
            lida: false,
            data: new Date().toISOString(),
          });
        } else {
          // Falha - bloquear acesso
          await supabase
            .from('premium_subscriptions')
            .update({ status: 'expired' })
            .eq('id', sub.id);

          await supabase.from('notifications').insert({
            user_id: sub.user_id,
            titulo: '⚠️ Falha na Renovação',
            mensagem: 'Não foi possível renovar sua assinatura. Atualize seus dados de pagamento.',
            lida: false,
            data: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar assinatura ${sub.id}:`, error);
    }
  }
}

/**
 * Envia lembretes de renovação
 */
async function sendRenewalRemindersToAllUsers(): Promise<void> {
  const { data: subscriptions } = await supabase
    .from('premium_subscriptions')
    .select('*')
    .eq('status', 'active');

  if (!subscriptions) return;

  const now = new Date();

  for (const sub of subscriptions) {
    try {
      const expiresAt = new Date(sub.data_renovacao);
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Enviar lembretes em 7, 3, 1 dias antes
      if ([7, 3, 1].includes(daysRemaining)) {
        await supabase.from('notifications').insert({
          user_id: sub.user_id,
          titulo: '⏰ Lembrete de Renovação',
          mensagem: `Sua assinatura Premium expira em ${daysRemaining} dia${daysRemaining > 1 ? 's' : ''}. Renove agora!`,
          lida: false,
          data: new Date().toISOString(),
        });

        console.log(`✅ Lembrete enviado para usuário ${sub.user_id} (${daysRemaining} dias)`);
      }
    } catch (error) {
      console.error(`❌ Erro ao enviar lembrete para ${sub.user_id}:`, error);
    }
  }
}

/**
 * Monitora odds para usuários premium
 */
async function monitorOddsForPremiumUsers(): Promise<void> {
  const { data: premiumUsers } = await supabase
    .from('premium_subscriptions')
    .select('user_id')
    .eq('status', 'active');

  if (!premiumUsers) return;

  // Buscar odds vantajosas (simulado)
  const hasOpportunity = Math.random() > 0.7;

  if (hasOpportunity) {
    const opportunities = [
      { match: 'Flamengo vs Palmeiras', platform: 'Bet365', odds: 2.85 },
      { match: 'Real Madrid vs Barcelona', platform: 'Betano', odds: 3.20 },
    ];

    const opp = opportunities[Math.floor(Math.random() * opportunities.length)];

    for (const user of premiumUsers) {
      await supabase.from('notifications').insert({
        user_id: user.user_id,
        titulo: '💎 Odds Vantajosas Detectadas!',
        mensagem: `${opp.match} - ${opp.platform} está pagando ${opp.odds} agora!`,
        lida: false,
        data: new Date().toISOString(),
      });
    }
  }
}

/**
 * Tenta renovar assinatura automaticamente
 */
async function attemptAutoRenewal(subscriptionId: string): Promise<boolean> {
  // Simular tentativa de pagamento (em produção, integraria com gateway)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const success = Math.random() > 0.2; // 80% de sucesso

  if (success) {
    const { data: sub } = await supabase
      .from('premium_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (sub) {
      const newExpirationDate = new Date();
      if (sub.plano === 'mensal') newExpirationDate.setMonth(newExpirationDate.getMonth() + 1);
      if (sub.plano === 'trimestral') newExpirationDate.setMonth(newExpirationDate.getMonth() + 3);
      if (sub.plano === 'anual') newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1);

      await supabase
        .from('premium_subscriptions')
        .update({
          data_renovacao: newExpirationDate.toISOString(),
          status: 'active',
        })
        .eq('id', subscriptionId);
    }
  }

  return success;
}

/**
 * Gera palpites para um usuário específico
 */
async function generatePredictionsForUser(userId: string, style: string): Promise<any[]> {
  // Simular geração de palpites (em produção, usaria IA real)
  const count = style === 'conservador' ? 3 : style === 'equilibrado' ? 5 : 8;

  return Array.from({ length: count }, (_, i) => ({
    match: `Partida ${i + 1}`,
    prediction: 'Vitória Casa',
    odds: (1.5 + Math.random() * 2).toFixed(2),
    confidence: Math.floor(60 + Math.random() * 30),
  }));
}
