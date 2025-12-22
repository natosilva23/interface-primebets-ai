// ============================================
// PÁGINA DE GERENCIAMENTO DE AUTOMAÇÕES
// ============================================

'use client';

import { useAutomations } from '@/lib/automations/useAutomationsHook';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  RefreshCw,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
} from 'lucide-react';

export default function AutomacoesPage() {
  const { automations, notifications, unreadCount, stopAll, restartAll, stop, restart } =
    useAutomations('user_demo'); // Em produção, pegar userId real

  const getAutomationIcon = (name: string) => {
    if (name.includes('prediction')) return <Zap className="w-5 h-5" />;
    if (name.includes('platform')) return <RefreshCw className="w-5 h-5" />;
    if (name.includes('performance')) return <TrendingUp className="w-5 h-5" />;
    if (name.includes('premium')) return <CheckCircle2 className="w-5 h-5" />;
    if (name.includes('renewal')) return <Bell className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getAutomationName = (name: string) => {
    const names: Record<string, string> = {
      'daily-predictions': 'Palpites Diários',
      'platform-updates': 'Atualização de Plataformas',
      'performance-reports': 'Relatórios de Performance',
      'premium-checks': 'Verificação Premium',
      'renewal-reminders': 'Lembretes de Renovação',
      'odds-monitoring': 'Monitoramento de Odds',
    };
    return names[name] || name;
  };

  const getAutomationDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      'daily-predictions': 'Envia palpites personalizados todos os dias às 8h',
      'platform-updates': 'Atualiza odds e ranking das plataformas a cada 6 horas',
      'performance-reports': 'Envia relatório semanal de desempenho toda segunda às 9h',
      'premium-checks': 'Verifica status das assinaturas premium a cada hora',
      'renewal-reminders': 'Envia lembretes de renovação diariamente às 10h',
      'odds-monitoring': 'Monitora odds vantajosas a cada 15 minutos (Premium)',
    };
    return descriptions[name] || 'Automação do sistema';
  };

  const formatNextRun = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `em ${days} dia${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
      return `em ${hours}h ${minutes}min`;
    }
    return `em ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Automações do Sistema</h1>
            <p className="text-gray-300">
              Gerencie todas as automações do PrimeBets AI em um só lugar
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={stopAll}
              variant="outline"
              className="bg-red-500/10 border-red-500 text-red-400 hover:bg-red-500/20"
            >
              <Pause className="w-4 h-4 mr-2" />
              Parar Todas
            </Button>
            <Button
              onClick={restartAll}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Reiniciar Todas
            </Button>
          </div>
        </div>

        {/* Notificações não lidas */}
        {unreadCount > 0 && (
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-orange-400" />
              <div>
                <h3 className="text-white font-semibold">
                  Você tem {unreadCount} notificação{unreadCount > 1 ? 'ões' : ''} não lida
                  {unreadCount > 1 ? 's' : ''}
                </h3>
                <p className="text-gray-300 text-sm">
                  Confira suas notificações para não perder nenhuma oportunidade
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Grid de Automações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map((automation) => (
            <Card
              key={automation.id}
              className="bg-white/5 backdrop-blur-sm border-white/10 p-6 hover:bg-white/10 transition-all"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                      {getAutomationIcon(automation.name)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        {getAutomationName(automation.name)}
                      </h3>
                      <Badge
                        variant={automation.enabled ? 'default' : 'secondary'}
                        className={
                          automation.enabled
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }
                      >
                        {automation.enabled ? 'Ativa' : 'Pausada'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-gray-300 text-sm">
                  {getAutomationDescription(automation.name)}
                </p>

                {/* Informações */}
                <div className="space-y-2 text-sm">
                  {automation.lastRun && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Última execução: {new Date(automation.lastRun).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {automation.enabled && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Próxima execução: {formatNextRun(automation.nextRun)}</span>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  {automation.enabled ? (
                    <Button
                      onClick={() => stop(automation.name)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => restart(automation.name)}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Ativar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Notificações Recentes */}
        {notifications.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações Recentes
            </h2>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{notif.titulo}</h4>
                    <p className="text-gray-300 text-sm">{notif.mensagem}</p>
                    <span className="text-gray-500 text-xs">
                      {new Date(notif.data).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Informações do Sistema */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Sobre as Automações</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                As automações do PrimeBets AI funcionam em segundo plano para garantir que você
                receba palpites personalizados, atualizações de plataformas, relatórios de
                desempenho e lembretes importantes no momento certo. Todas as automações são
                executadas automaticamente e podem ser pausadas ou reiniciadas a qualquer momento.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
