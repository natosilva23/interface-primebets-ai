// ============================================
// TIPOS E INTERFACES DO PRIMEBETS AI
// ============================================

// ========== USUÁRIO ==========
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  isPremium: boolean;
  premiumExpiresAt?: Date;
  bettorStyle?: BettorStyle;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  favoritesSports: string[];
  notificationsEnabled: boolean;
  riskTolerance: 'low' | 'medium' | 'high';
}

// ========== AUTENTICAÇÃO ==========
export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

// ========== QUESTIONÁRIO ==========
export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  weight: number;
  category: 'frequency' | 'amount' | 'risk' | 'type' | 'odds' | 'sport';
}

export interface QuizOption {
  id: string;
  text: string;
  value: number;
  riskLevel: number;
}

export interface QuizAnswer {
  questionId: number;
  optionId: string;
  value: number;
}

export interface QuizResult {
  style: BettorStyle;
  scores: {
    conservative: number;
    balanced: number;
    highRisk: number;
    strategic: number;
    recreational: number;
  };
  confidence: number;
}

export type BettorStyle = 
  | 'conservative' 
  | 'balanced' 
  | 'highRisk' 
  | 'strategic' 
  | 'recreational';

// ========== ANÁLISE INTELIGENTE ==========
export interface AnalysisRequest {
  userId: string;
  sport: string;
  market: string;
  userStyle: BettorStyle;
  maxPredictions?: number;
}

export interface Prediction {
  id: string;
  sport: string;
  league: string;
  match: string;
  market: string;
  prediction: string;
  odds: number;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  reasoning: string;
  createdAt: Date;
}

export interface AnalysisResult {
  predictions: Prediction[];
  summary: {
    averageConfidence: number;
    averageOdds: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
    };
  };
  recommendedStake: number;
}

// ========== PLATAFORMAS ==========
export interface BettingPlatform {
  id: string;
  name: string;
  logo: string;
  rating: number;
  markets: PlatformMarket[];
}

export interface PlatformMarket {
  sport: string;
  market: string;
  averageOdds: number;
  commission: number;
}

export interface PlatformComparison {
  platforms: BettingPlatform[];
  bestOverall: string;
  bestByMarket: Record<string, string>;
  recommendations: string[];
}

// ========== PREMIUM ==========
export interface PremiumSubscription {
  userId: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  expiresAt: Date;
  autoRenew: boolean;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
}

// ========== NOTIFICAÇÕES ==========
export interface Notification {
  id: string;
  userId: string;
  type: 'newPrediction' | 'advantageousOdds' | 'renewal' | 'update';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}

// ========== HISTÓRICO ==========
export interface BetHistory {
  id: string;
  userId: string;
  predictionId: string;
  stake: number;
  odds: number;
  result?: 'win' | 'loss' | 'pending';
  profit?: number;
  placedAt: Date;
  settledAt?: Date;
}

export interface UserStatistics {
  userId: string;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  winRate: number;
  totalProfit: number;
  averageOdds: number;
  bestStreak: number;
  currentStreak: number;
  weeklyEvolution: WeeklyStats[];
}

export interface WeeklyStats {
  week: string;
  bets: number;
  wins: number;
  profit: number;
  winRate: number;
}

// ========== PAGAMENTOS ==========
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  createdAt: Date;
}

// ========== RESPOSTAS API ==========
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
