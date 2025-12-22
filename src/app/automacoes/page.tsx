'use client';

// ============================================
// PÁGINA: Configurações de Automações
// ============================================

import { useState, useEffect } from 'react';
import { useAutomations } from '@/lib/automations/useAutomations';
import { AutomationsDashboard } from '@/components/custom/AutomationsDashboard';
import {
  AUTOMATION_CONFIG,
  updateAutomationConfig,
  resetAutomationConfig,
} from '@/lib/automations/config';
import { Bell, RefreshCw, TrendingUp, Shield, Calendar, Settings } from 'lucide-react';

export default function AutomacoesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const { isInitialized, restart, config } = useAutomations(userId);

  useEffect(() => {
    // Obter userId do localStorage (simulado)
    const storedUserId = localStorage.getItem('current_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleToggleAutomation = (
    name: keyof typeof AUTOMATION_CONFIG,
    enabled: boolean
  ) => {
    updateAutomationConfig(name, { enabled });
    if (userId) restart();
  };

  const handleResetConfig = () => {
    if (confirm('Deseja restaurar as configurações padrão?')) {
      resetAutomationConfig();
      if (userId) restart();
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Faça login para acessar as automações
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ⚙️ Configurações de Automações
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie todas as automações do PrimeBets AI
            </p>
          </div>
          <button
            onClick={handleResetConfig}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Restaurar Padrões
          </button>
        </div>

        {/* Dashboard */}
        <AutomationsDashboard userId={userId} />

        {/* Configurações Detalhadas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configurações Detalhadas
          </h2>

          <div className="space-y-6">
            {/* Palpites Diários */}
            <AutomationSetting
              icon={<Bell className="w-5 h-5" />}
              title="Palpites Diários"
              description="Receba palpites personalizados todo dia às 8h da manhã"
              enabled={config.dailyPredictions.enabled}
              onToggle={(enabled) => handleToggleAutomation('dailyPredictions', enabled)}
              details={[
                `Horário: ${config.dailyPredictions.time}`,
                `Timezone: ${config.dailyPredictions.timezone}`,
              ]}
            />

            {/* Atualização de Plataformas */}
            <AutomationSetting
              icon={<RefreshCw className="w-5 h-5" />}
              title="Atualização de Plataformas"
              description="Atualiza odds e ranking das plataformas automaticamente"
              enabled={config.platformUpdates.enabled}
              onToggle={(enabled) => handleToggleAutomation('platformUpdates', enabled)}
              details={[
                `Intervalo: A cada ${config.platformUpdates.intervalHours} horas`,
                `Retry: ${config.platformUpdates.retryOnError ? 'Sim' : 'Não'}`,
                `Max Retries: ${config.platformUpdates.maxRetries}`,
              ]}
            />

            {/* Relatórios de Performance */}
            <AutomationSetting
              icon={<TrendingUp className="w-5 h-5" />}
              title="Relatórios de Performance"
              description="Receba relatórios semanais com suas estatísticas"
              enabled={config.performanceReports.enabled}
              onToggle={(enabled) => handleToggleAutomation('performanceReports', enabled)}
              details={[
                `Dia: ${config.performanceReports.day}`,
                `Horário: ${config.performanceReports.time}`,
                `Recomendações: ${config.performanceReports.includeRecommendations ? 'Sim' : 'Não'}`,
              ]}
            />

            {/* Verificação Premium */}
            <AutomationSetting
              icon={<Shield className="w-5 h-5" />}
              title="Verificação Premium"
              description="Monitora status da assinatura e gerencia renovações"
              enabled={config.premiumChecks.enabled}
              onToggle={(enabled) => handleToggleAutomation('premiumChecks', enabled)}
              details={[
                `Intervalo: A cada ${config.premiumChecks.intervalHours} hora`,
                `Auto-renovação: ${config.premiumChecks.autoRenew ? 'Ativa' : 'Inativa'}`,
                `Notificar expiração: ${config.premiumChecks.notifyOnExpiration ? 'Sim' : 'Não'}`,
              ]}
            />

            {/* Lembretes de Renovação */}
            <AutomationSetting
              icon={<Calendar className="w-5 h-5" />}
              title="Lembretes de Renovação"
              description="Receba avisos antes da sua assinatura expirar"
              enabled={config.renewalReminders.enabled}
              onToggle={(enabled) => handleToggleAutomation('renewalReminders', enabled)}
              details={[
                `Horário: ${config.renewalReminders.time}`,
                `Lembretes: ${config.renewalReminders.reminderDays.join(', ')} dias antes`,
              ]}
            />
          </div>
        </div>

        {/* Status do Sistema */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">📊 Status do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm opacity-80 mb-1">Status</p>
              <p className="text-2xl font-bold">
                {isInitialized ? '✅ Online' : '⏳ Inicializando'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm opacity-80 mb-1">Automações Ativas</p>
              <p className="text-2xl font-bold">
                {Object.values(config).filter((c: any) => c.enabled).length} / 5
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm opacity-80 mb-1">Última Atualização</p>
              <p className="text-2xl font-bold">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AutomationSettingProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  details: string[];
}

function AutomationSetting({
  icon,
  title,
  description,
  enabled,
  onToggle,
  details,
}: AutomationSettingProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg">
        {icon}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={() => onToggle(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {description}
        </p>

        <div className="space-y-1">
          {details.map((detail, index) => (
            <p key={index} className="text-xs text-gray-500 dark:text-gray-500">
              • {detail}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
