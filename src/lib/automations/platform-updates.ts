// ============================================
// AUTOMAÇÃO: ATUALIZAÇÃO DE PLATAFORMAS
// ============================================

import { BETTING_PLATFORMS } from '../constants/betting';

interface PlatformData {
  id: string;
  name: string;
  averageOdds: number;
  ranking: number;
  lastUpdate: Date;
  markets: {
    football: number;
    basketball: number;
    tennis: number;
  };
}

/**
 * Agenda atualização de plataformas a cada 6 horas
 */
export function schedulePlatformUpdates(): void {
  // Executar imediatamente na primeira vez
  updatePlatformsData();

  // Repetir a cada 6 horas
  setInterval(() => {
    updatePlatformsData();
  }, 6 * 60 * 60 * 1000);

  console.log('🔄 Atualização de plataformas agendada (a cada 6 horas)');
}

/**
 * Atualiza dados de todas as plataformas
 */
async function updatePlatformsData(): Promise<void> {
  console.log('🔄 Iniciando atualização de plataformas...');

  try {
    const updatedPlatforms: PlatformData[] = [];

    // Atualizar cada plataforma
    for (const platform of BETTING_PLATFORMS) {
      const data = await fetchPlatformData(platform.id);
      updatedPlatforms.push(data);
    }

    // Calcular ranking
    const rankedPlatforms = calculateRanking(updatedPlatforms);

    // Salvar dados atualizados
    savePlatformsData(rankedPlatforms);

    console.log('✅ Plataformas atualizadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar plataformas:', error);
  }
}

/**
 * Busca dados atualizados de uma plataforma
 * Em produção, isso consultaria APIs reais ou faria web scraping
 */
async function fetchPlatformData(platformId: string): Promise<PlatformData> {
  // Simular delay de API
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Gerar dados simulados (em produção viria de APIs reais)
  const baseOdds = 1.5 + Math.random() * 2;

  return {
    id: platformId,
    name: BETTING_PLATFORMS.find((p) => p.id === platformId)?.name || platformId,
    averageOdds: Math.round(baseOdds * 100) / 100,
    ranking: 0, // Será calculado depois
    lastUpdate: new Date(),
    markets: {
      football: Math.round((baseOdds * 1.1) * 100) / 100,
      basketball: Math.round((baseOdds * 0.95) * 100) / 100,
      tennis: Math.round((baseOdds * 1.05) * 100) / 100,
    },
  };
}

/**
 * Calcula ranking das plataformas baseado em múltiplos fatores
 */
function calculateRanking(platforms: PlatformData[]): PlatformData[] {
  // Ordenar por odds médias (maior = melhor)
  const sorted = [...platforms].sort((a, b) => b.averageOdds - a.averageOdds);

  // Atribuir ranking
  sorted.forEach((platform, index) => {
    platform.ranking = index + 1;
  });

  return sorted;
}

/**
 * Salva dados atualizados no storage
 */
function savePlatformsData(platforms: PlatformData[]): void {
  localStorage.setItem('platforms_data', JSON.stringify(platforms));
  localStorage.setItem('platforms_last_update', new Date().toISOString());
}

/**
 * Obtém dados salvos das plataformas
 */
export function getPlatformsData(): PlatformData[] {
  const data = localStorage.getItem('platforms_data');
  if (!data) return [];

  try {
    const platforms = JSON.parse(data);
    return platforms.map((p: any) => ({
      ...p,
      lastUpdate: new Date(p.lastUpdate),
    }));
  } catch {
    return [];
  }
}

/**
 * Obtém última data de atualização
 */
export function getLastUpdateTime(): Date | null {
  const timestamp = localStorage.getItem('platforms_last_update');
  if (!timestamp) return null;

  try {
    return new Date(timestamp);
  } catch {
    return null;
  }
}

/**
 * Verifica se dados estão desatualizados (mais de 6 horas)
 */
export function isPlatformDataStale(): boolean {
  const lastUpdate = getLastUpdateTime();
  if (!lastUpdate) return true;

  const now = new Date();
  const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

  return diffHours > 6;
}

/**
 * Força atualização imediata das plataformas
 */
export async function forceUpdatePlatforms(): Promise<void> {
  console.log('⚡ Forçando atualização imediata das plataformas...');
  await updatePlatformsData();
}
