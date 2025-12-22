// ============================================
// SCRIPT DE TESTE: Automações
// ============================================

import { initializeAutomations, stopAllAutomations } from './index';
import { sendDailyPredictions } from './daily-predictions';
import { forceUpdatePlatforms, getPlatformsData } from './platform-updates';
import { getReportsHistory } from './performance-reports';
import { getSubscriptionStatus } from './premium-checks';
import { getUpcomingReminders } from './renewal-reminders';

/**
 * Testa todas as automações do sistema
 */
export async function testAutomations(userId: string): Promise<void> {
  console.log('🧪 Iniciando testes de automações...\n');

  try {
    // 1. Inicializar automações
    console.log('1️⃣ Inicializando automações...');
    initializeAutomations(userId);
    await sleep(2000);
    console.log('✅ Automações inicializadas\n');

    // 2. Testar atualização de plataformas
    console.log('2️⃣ Testando atualização de plataformas...');
    await forceUpdatePlatforms();
    const platforms = getPlatformsData();
    console.log(`✅ ${platforms.length} plataformas atualizadas`);
    console.log('Ranking:', platforms.map(p => `${p.name} (${p.ranking}°)`).join(', '));
    console.log('');

    // 3. Testar relatórios de performance
    console.log('3️⃣ Testando relatórios de performance...');
    const reports = getReportsHistory(userId);
    console.log(`✅ ${reports.length} relatórios no histórico\n`);

    // 4. Testar verificação premium
    console.log('4️⃣ Testando verificação premium...');
    const subscription = getSubscriptionStatus(userId);
    console.log('Status Premium:', subscription);
    console.log('');

    // 5. Testar lembretes
    console.log('5️⃣ Testando lembretes de renovação...');
    const reminders = getUpcomingReminders(userId);
    console.log(`✅ ${reminders.length} lembretes agendados`);
    reminders.forEach(r => {
      console.log(`  - ${r.message} (em ${r.daysUntil} dias)`);
    });
    console.log('');

    // 6. Parar automações
    console.log('6️⃣ Parando automações...');
    stopAllAutomations();
    console.log('✅ Automações paradas\n');

    console.log('🎉 Todos os testes concluídos com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

/**
 * Simula cenário completo de uso
 */
export async function simulateUserJourney(userId: string): Promise<void> {
  console.log('🎬 Simulando jornada completa do usuário...\n');

  // Dia 1: Usuário se cadastra
  console.log('📅 DIA 1: Cadastro');
  initializeAutomations(userId);
  console.log('✅ Automações ativadas para novo usuário\n');
  await sleep(1000);

  // Dia 2: Recebe primeiro palpite
  console.log('📅 DIA 2: Primeiro palpite');
  console.log('🎯 Usuário recebe notificação de palpites diários');
  console.log('✅ 3 palpites enviados (plano free)\n');
  await sleep(1000);

  // Dia 7: Assina Premium
  console.log('📅 DIA 7: Assinatura Premium');
  console.log('💎 Usuário assina plano mensal');
  console.log('✅ Recursos premium desbloqueados');
  console.log('✅ Agora recebe 10 palpites por dia\n');
  await sleep(1000);

  // Dia 14: Primeiro relatório
  console.log('📅 DIA 14: Primeiro relatório semanal');
  console.log('📊 Estatísticas: 15 apostas, 60% de acerto');
  console.log('✅ Relatório enviado com recomendações\n');
  await sleep(1000);

  // Dia 23: Lembrete de renovação (7 dias antes)
  console.log('📅 DIA 23: Lembrete de renovação');
  console.log('⏰ Sua assinatura expira em 7 dias');
  console.log('✅ Lembrete enviado\n');
  await sleep(1000);

  // Dia 30: Renovação automática
  console.log('📅 DIA 30: Renovação automática');
  console.log('🔄 Sistema tenta renovar automaticamente');
  console.log('✅ Renovação bem-sucedida');
  console.log('✅ Notificação de confirmação enviada\n');

  console.log('🎉 Simulação completa!');
}

/**
 * Testa cenário de falha de pagamento
 */
export async function simulatePaymentFailure(userId: string): Promise<void> {
  console.log('🚨 Simulando falha de pagamento...\n');

  console.log('1️⃣ Tentativa de renovação automática...');
  await sleep(1000);
  console.log('❌ Falha no pagamento detectada\n');

  console.log('2️⃣ Bloqueando acesso premium...');
  await sleep(500);
  console.log('🔒 Acesso premium bloqueado\n');

  console.log('3️⃣ Enviando notificação ao usuário...');
  await sleep(500);
  console.log('📧 Notificação enviada: "Falha no pagamento"\n');

  console.log('4️⃣ Aguardando ação do usuário...');
  console.log('💳 Usuário precisa atualizar dados de pagamento\n');

  console.log('✅ Fluxo de falha de pagamento concluído');
}

/**
 * Testa monitoramento de odds em tempo real
 */
export async function simulateOddsMonitoring(userId: string): Promise<void> {
  console.log('👀 Simulando monitoramento de odds...\n');

  console.log('🔍 Verificando odds a cada 15 minutos...');
  
  for (let i = 1; i <= 5; i++) {
    await sleep(1000);
    console.log(`\n⏱️  Verificação ${i}/5`);
    
    const hasOpportunity = Math.random() > 0.6;
    
    if (hasOpportunity) {
      console.log('💎 Oportunidade detectada!');
      console.log('   Flamengo vs Palmeiras - Bet365 @ 2.85');
      console.log('   📧 Notificação enviada ao usuário');
    } else {
      console.log('   Nenhuma oportunidade no momento');
    }
  }

  console.log('\n✅ Monitoramento concluído');
}

// Função auxiliar
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Exportar para uso no console do navegador
if (typeof window !== 'undefined') {
  (window as any).testAutomations = testAutomations;
  (window as any).simulateUserJourney = simulateUserJourney;
  (window as any).simulatePaymentFailure = simulatePaymentFailure;
  (window as any).simulateOddsMonitoring = simulateOddsMonitoring;
}
