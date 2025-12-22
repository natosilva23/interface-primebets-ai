'use client';

// ============================================
// COMPONENTE: Dashboard de Automações
// ============================================

import { useEffect, useState } from 'react';
import { useAutomations } from '@/lib/automations/useAutomations';
import { Bell, RefreshCw, TrendingUp, Shield, Calendar } from 'lucide-react';

interface AutomationsDashboardProps {
  userId: string;
}

export function AutomationsDashboard({ userId }: AutomationsDashboardProps) {
  const {
    isInitialized,
    automationsStatus,
    getPlatformsStatus,
    getReports,
    getSubscription,
    getReminders,
  } = useAutomations(userId);

  const [platformsStatus, setPlatformsStatus] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    if (isInitialized) {
      setPlatformsStatus(getPlatformsStatus());
      setSubscription(getSubscription());
      setReminders(getReminders());
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">
          Inicializando automações...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🤖 Automações Ativas
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Sistema Online
          </span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Notificações Diárias */}
        <AutomationCard
          icon={<Bell className="w-6 h-6" />}
          title="Palpites Diários"
          status={automationsStatus.dailyPredictions}
          description="Enviados todo dia às 8h"
          color="blue"
        />

        {/* Atualização de Plataformas */}
        <AutomationCard
          icon={<RefreshCw className="w-6 h-6" />}
          title="Atualização de Odds"
          status={automationsStatus.platformUpdates}
          description={
            platformsStatus?.lastUpdate
              ? `Última: ${new Date(platformsStatus.lastUpdate).toLocaleTimeString()}`
              : 'A cada 6 horas'
          }
          color="purple"
        />

        {/* Relatórios de Performance */}
        <AutomationCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Relatórios Semanais"
          status={automationsStatus.performanceReports}
          description="Toda segunda às 9h"
          color="green"
        />

        {/* Verificação Premium */}
        <AutomationCard
          icon={<Shield className="w-6 h-6" />}
          title="Verificação Premium"
          status={automationsStatus.premiumChecks}
          description={
            subscription?.isPremium
              ? `${subscription.daysRemaining} dias restantes`
              : 'Monitoramento ativo'
          }
          color="yellow"
        />

        {/* Lembretes de Renovação */}
        <AutomationCard
          icon={<Calendar className="w-6 h-6" />}
          title="Lembretes"
          status={automationsStatus.renewalReminders}
          description={
            reminders.length > 0
              ? `${reminders.length} agendados`
              : 'Nenhum pendente'
          }
          color="red"
        />
      </div>

      {/* Próximos Eventos */}
      {reminders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📅 Próximos Lembretes
          </h3>
          <div className="space-y-3">
            {reminders.map((reminder, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {reminder.message}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Em {reminder.daysUntil} dias
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    reminder.type === 'critical'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : reminder.type === 'urgent'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  }`}
                >
                  {reminder.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AutomationCardProps {
  icon: React.ReactNode;
  title: string;
  status: boolean;
  description: string;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'red';
}

function AutomationCard({
  icon,
  title,
  status,
  description,
  color,
}: AutomationCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white`}
        >
          {icon}
        </div>
        <div
          className={`w-3 h-3 rounded-full ${
            status ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
