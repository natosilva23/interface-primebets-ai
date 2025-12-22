// ============================================
// CONSTANTES DO SISTEMA DE APOSTAS
// ============================================

import { QuizQuestion, BettorStyle } from '../types';

// ========== QUESTIONÁRIO ==========
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Com que frequência você faz apostas esportivas?',
    category: 'frequency',
    weight: 1.2,
    options: [
      { id: 'freq_1', text: 'Raramente (1-2 vezes por mês)', value: 1, riskLevel: 1 },
      { id: 'freq_2', text: 'Ocasionalmente (1-2 vezes por semana)', value: 2, riskLevel: 2 },
      { id: 'freq_3', text: 'Regularmente (3-5 vezes por semana)', value: 3, riskLevel: 3 },
      { id: 'freq_4', text: 'Diariamente', value: 4, riskLevel: 4 },
    ],
  },
  {
    id: 2,
    question: 'Qual é o valor médio que você investe por aposta?',
    category: 'amount',
    weight: 1.5,
    options: [
      { id: 'amount_1', text: 'Até R$ 20', value: 1, riskLevel: 1 },
      { id: 'amount_2', text: 'R$ 20 - R$ 50', value: 2, riskLevel: 2 },
      { id: 'amount_3', text: 'R$ 50 - R$ 100', value: 3, riskLevel: 3 },
      { id: 'amount_4', text: 'Acima de R$ 100', value: 4, riskLevel: 4 },
    ],
  },
  {
    id: 3,
    question: 'Qual é sua preferência de risco?',
    category: 'risk',
    weight: 2.0,
    options: [
      { id: 'risk_1', text: 'Prefiro segurança, mesmo com retorno menor', value: 1, riskLevel: 1 },
      { id: 'risk_2', text: 'Equilíbrio entre segurança e retorno', value: 2, riskLevel: 2 },
      { id: 'risk_3', text: 'Aceito risco moderado por retorno maior', value: 3, riskLevel: 3 },
      { id: 'risk_4', text: 'Alto risco, alto retorno', value: 4, riskLevel: 4 },
    ],
  },
  {
    id: 4,
    question: 'Que tipo de palpite você prefere?',
    category: 'type',
    weight: 1.3,
    options: [
      { id: 'type_1', text: 'Apostas simples (1 jogo)', value: 1, riskLevel: 1 },
      { id: 'type_2', text: 'Múltiplas com 2-3 jogos', value: 2, riskLevel: 2 },
      { id: 'type_3', text: 'Múltiplas com 4-6 jogos', value: 3, riskLevel: 3 },
      { id: 'type_4', text: 'Múltiplas com 7+ jogos', value: 4, riskLevel: 4 },
    ],
  },
  {
    id: 5,
    question: 'Qual faixa de odds você prefere?',
    category: 'odds',
    weight: 1.4,
    options: [
      { id: 'odds_1', text: '1.20 - 1.50 (Favoritos)', value: 1, riskLevel: 1 },
      { id: 'odds_2', text: '1.50 - 2.00 (Equilibradas)', value: 2, riskLevel: 2 },
      { id: 'odds_3', text: '2.00 - 3.50 (Arriscadas)', value: 3, riskLevel: 3 },
      { id: 'odds_4', text: 'Acima de 3.50 (Zebras)', value: 4, riskLevel: 4 },
    ],
  },
  {
    id: 6,
    question: 'Qual modalidade esportiva você mais aposta?',
    category: 'sport',
    weight: 1.0,
    options: [
      { id: 'sport_1', text: 'Futebol', value: 1, riskLevel: 2 },
      { id: 'sport_2', text: 'Basquete', value: 2, riskLevel: 2 },
      { id: 'sport_3', text: 'Tênis', value: 3, riskLevel: 2 },
      { id: 'sport_4', text: 'Esportes variados', value: 4, riskLevel: 3 },
    ],
  },
];

// ========== ESTILOS DE APOSTADOR ==========
export const BETTOR_STYLES: Record<BettorStyle, {
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  oddsRange: [number, number];
  recommendedStake: number;
  maxPredictions: number;
}> = {
  conservative: {
    name: 'Conservador',
    description: 'Prefere segurança e apostas de baixo risco com retornos consistentes',
    riskLevel: 'low',
    oddsRange: [1.20, 1.80],
    recommendedStake: 2,
    maxPredictions: 3,
  },
  balanced: {
    name: 'Equilibrado',
    description: 'Busca equilíbrio entre risco e retorno',
    riskLevel: 'medium',
    oddsRange: [1.50, 2.50],
    recommendedStake: 3,
    maxPredictions: 5,
  },
  highRisk: {
    name: 'Alto Risco',
    description: 'Aceita riscos elevados em busca de grandes retornos',
    riskLevel: 'high',
    oddsRange: [2.00, 5.00],
    recommendedStake: 5,
    maxPredictions: 8,
  },
  strategic: {
    name: 'Estratégico',
    description: 'Analisa profundamente e faz apostas calculadas',
    riskLevel: 'medium',
    oddsRange: [1.60, 2.80],
    recommendedStake: 3,
    maxPredictions: 4,
  },
  recreational: {
    name: 'Recreativo',
    description: 'Aposta por diversão, sem grandes preocupações',
    riskLevel: 'medium',
    oddsRange: [1.40, 3.00],
    recommendedStake: 2,
    maxPredictions: 6,
  },
};

// ========== PLATAFORMAS DE APOSTAS ==========
export const BETTING_PLATFORMS = [
  {
    id: 'bet365',
    name: 'Bet365',
    logo: '🎯',
    rating: 4.8,
    commission: 0.05,
  },
  {
    id: 'betano',
    name: 'Betano',
    logo: '⚡',
    rating: 4.7,
    commission: 0.06,
  },
  {
    id: 'blaze',
    name: 'Blaze',
    logo: '🔥',
    rating: 4.5,
    commission: 0.07,
  },
  {
    id: 'sportingbet',
    name: 'SportingBet',
    logo: '🏆',
    rating: 4.6,
    commission: 0.06,
  },
  {
    id: '1xbet',
    name: '1xBet',
    logo: '💎',
    rating: 4.4,
    commission: 0.08,
  },
];

// ========== ESPORTES E MERCADOS ==========
export const SPORTS = [
  { id: 'football', name: 'Futebol', icon: '⚽' },
  { id: 'basketball', name: 'Basquete', icon: '🏀' },
  { id: 'tennis', name: 'Tênis', icon: '🎾' },
  { id: 'volleyball', name: 'Vôlei', icon: '🏐' },
  { id: 'mma', name: 'MMA', icon: '🥊' },
];

export const MARKETS = [
  { id: 'match_result', name: 'Resultado Final', icon: '🎯' },
  { id: 'over_under', name: 'Mais/Menos Gols', icon: '📊' },
  { id: 'both_score', name: 'Ambos Marcam', icon: '⚽' },
  { id: 'handicap', name: 'Handicap', icon: '⚖️' },
  { id: 'first_goal', name: 'Primeiro Gol', icon: '🥇' },
];

// ========== FEATURES PREMIUM ==========
export const PREMIUM_FEATURES = [
  {
    id: 'platform_comparison',
    name: 'Comparador de Plataformas',
    description: 'Compare odds entre todas as plataformas em tempo real',
    isPremium: true,
  },
  {
    id: 'advanced_analysis',
    name: 'Análise Avançada',
    description: 'Análises detalhadas com IA e estatísticas profundas',
    isPremium: true,
  },
  {
    id: 'unlimited_predictions',
    name: 'Palpites Ilimitados',
    description: 'Receba quantos palpites quiser por dia',
    isPremium: true,
  },
  {
    id: 'priority_notifications',
    name: 'Notificações Prioritárias',
    description: 'Seja o primeiro a saber sobre odds vantajosas',
    isPremium: true,
  },
  {
    id: 'detailed_history',
    name: 'Histórico Detalhado',
    description: 'Acesse estatísticas completas e evolução semanal',
    isPremium: true,
  },
];

// ========== CONFIGURAÇÕES ==========
export const APP_CONFIG = {
  FREE_PREDICTIONS_PER_DAY: 3,
  PREMIUM_PREDICTIONS_PER_DAY: 999,
  SESSION_DURATION_HOURS: 24,
  TOKEN_EXPIRY_DAYS: 30,
  MIN_CONFIDENCE_THRESHOLD: 60,
  MAX_CONFIDENCE_THRESHOLD: 95,
};
