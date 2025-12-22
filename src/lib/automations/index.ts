// ============================================
// SISTEMA DE AUTOMAÇÕES DO PRIMEBETS AI
// ============================================

import { initializeAllAutomations, scheduler } from './scheduler';

/**
 * Inicializa todas as automações do sistema
 */
export function initializeAutomations(): void {
  console.log('🤖 Inicializando automações do PrimeBets AI...');

  // Iniciar scheduler central
  initializeAllAutomations();

  console.log('✅ Automações inicializadas com sucesso!');
}

/**
 * Para todas as automações
 */
export function stopAllAutomations(): void {
  scheduler.stopAll();
  console.log('🛑 Todas as automações foram paradas');
}

/**
 * Reinicia todas as automações
 */
export function restartAutomations(): void {
  stopAllAutomations();
  initializeAutomations();
  console.log('🔄 Automações reiniciadas');
}

/**
 * Lista status de todas as automações
 */
export function getAutomationsStatus() {
  return scheduler.list();
}

/**
 * Para uma automação específica
 */
export function stopAutomation(name: string): void {
  scheduler.stop(name);
}

/**
 * Reinicia uma automação específica
 */
export function restartAutomation(name: string): void {
  scheduler.restart(name);
}

// Exportar módulos individuais
export * from './scheduler';
export * from './notifications-handler';
export * from './config';
export * from './daily-predictions';
export * from './platform-updates';
export * from './performance-reports';
export * from './premium-checks';
export * from './renewal-reminders';
