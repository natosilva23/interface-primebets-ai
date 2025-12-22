// ============================================
// SERVIÇO: AUTENTICAÇÃO E SEGURANÇA
// ============================================

import { User, AuthSession, LoginCredentials, RegisterData } from '../types';
import { APP_CONFIG } from '../constants/betting';
import { hashPassword, verifyPassword, generateToken } from '../utils/crypto';

/**
 * Registra novo usuário
 */
export async function registerUser(data: RegisterData): Promise<User> {
  // Validar dados
  if (!data.email || !data.password || !data.name) {
    throw new Error('Todos os campos são obrigatórios');
  }

  if (!isValidEmail(data.email)) {
    throw new Error('Email inválido');
  }

  if (data.password.length < 6) {
    throw new Error('Senha deve ter no mínimo 6 caracteres');
  }

  // Verificar se email já existe
  if (emailExists(data.email)) {
    throw new Error('Email já cadastrado');
  }

  // Criar usuário
  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: data.email,
    name: data.name,
    createdAt: new Date(),
    isPremium: false,
  };

  // Hash da senha
  const hashedPassword = await hashPassword(data.password);

  // Salvar usuário
  saveUser(user, hashedPassword);

  return user;
}

/**
 * Faz login do usuário
 */
export async function loginUser(credentials: LoginCredentials): Promise<{
  user: User;
  session: AuthSession;
}> {
  // Validar dados
  if (!credentials.email || !credentials.password) {
    throw new Error('Email e senha são obrigatórios');
  }

  // Buscar usuário
  const user = getUserByEmail(credentials.email);
  if (!user) {
    throw new Error('Email ou senha incorretos');
  }

  // Verificar senha
  const storedPassword = getStoredPassword(user.id);
  const isValid = await verifyPassword(credentials.password, storedPassword);

  if (!isValid) {
    throw new Error('Email ou senha incorretos');
  }

  // Criar sessão
  const session = createSession(user.id);

  return { user, session };
}

/**
 * Faz logout do usuário
 */
export function logoutUser(userId: string): void {
  deleteSession(userId);
}

/**
 * Verifica se sessão é válida
 */
export function isSessionValid(token: string): boolean {
  const session = getSessionByToken(token);
  
  if (!session) return false;

  // Verificar se não expirou
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);

  return expiresAt > now;
}

/**
 * Obtém usuário pela sessão
 */
export function getUserBySession(token: string): User | null {
  const session = getSessionByToken(token);
  if (!session || !isSessionValid(token)) return null;

  return getUserById(session.userId);
}

/**
 * Cria nova sessão
 */
function createSession(userId: string): AuthSession {
  const token = generateToken();
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setHours(expiresAt.getHours() + APP_CONFIG.SESSION_DURATION_HOURS);

  const session: AuthSession = {
    userId,
    token,
    expiresAt,
    createdAt: now,
  };

  // Salvar sessão
  localStorage.setItem(`session_${userId}`, JSON.stringify(session));
  localStorage.setItem(`session_token_${token}`, JSON.stringify(session));

  return session;
}

/**
 * Deleta sessão
 */
function deleteSession(userId: string): void {
  const session = getSession(userId);
  if (session) {
    localStorage.removeItem(`session_token_${session.token}`);
  }
  localStorage.removeItem(`session_${userId}`);
}

/**
 * Obtém sessão por userId
 */
function getSession(userId: string): AuthSession | null {
  const data = localStorage.getItem(`session_${userId}`);
  if (!data) return null;

  try {
    const session = JSON.parse(data);
    return {
      ...session,
      expiresAt: new Date(session.expiresAt),
      createdAt: new Date(session.createdAt),
    };
  } catch {
    return null;
  }
}

/**
 * Obtém sessão por token
 */
function getSessionByToken(token: string): AuthSession | null {
  const data = localStorage.getItem(`session_token_${token}`);
  if (!data) return null;

  try {
    const session = JSON.parse(data);
    return {
      ...session,
      expiresAt: new Date(session.expiresAt),
      createdAt: new Date(session.createdAt),
    };
  } catch {
    return null;
  }
}

/**
 * Salva usuário
 */
function saveUser(user: User, hashedPassword: string): void {
  localStorage.setItem(`user_${user.id}`, JSON.stringify(user));
  localStorage.setItem(`user_email_${user.email}`, user.id);
  localStorage.setItem(`user_password_${user.id}`, hashedPassword);
}

/**
 * Obtém usuário por ID
 */
export function getUserById(userId: string): User | null {
  const data = localStorage.getItem(`user_${userId}`);
  if (!data) return null;

  try {
    const user = JSON.parse(data);
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      premiumExpiresAt: user.premiumExpiresAt
        ? new Date(user.premiumExpiresAt)
        : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Obtém usuário por email
 */
function getUserByEmail(email: string): User | null {
  const userId = localStorage.getItem(`user_email_${email}`);
  if (!userId) return null;

  return getUserById(userId);
}

/**
 * Obtém senha armazenada
 */
function getStoredPassword(userId: string): string {
  return localStorage.getItem(`user_password_${userId}`) || '';
}

/**
 * Verifica se email existe
 */
function emailExists(email: string): boolean {
  return localStorage.getItem(`user_email_${email}`) !== null;
}

/**
 * Valida formato de email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Atualiza dados do usuário
 */
export function updateUser(userId: string, updates: Partial<User>): User | null {
  const user = getUserById(userId);
  if (!user) return null;

  const updatedUser = { ...user, ...updates };
  localStorage.setItem(`user_${userId}`, JSON.stringify(updatedUser));

  return updatedUser;
}

/**
 * Altera senha do usuário
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  // Verificar senha atual
  const storedPassword = getStoredPassword(userId);
  const isValid = await verifyPassword(currentPassword, storedPassword);

  if (!isValid) {
    throw new Error('Senha atual incorreta');
  }

  if (newPassword.length < 6) {
    throw new Error('Nova senha deve ter no mínimo 6 caracteres');
  }

  // Hash da nova senha
  const hashedPassword = await hashPassword(newPassword);

  // Salvar nova senha
  localStorage.setItem(`user_password_${userId}`, hashedPassword);

  return true;
}

/**
 * Recuperação de senha (envia email)
 */
export async function requestPasswordReset(email: string): Promise<boolean> {
  const user = getUserByEmail(email);
  if (!user) {
    // Por segurança, não revelar se email existe
    return true;
  }

  // Gerar token de recuperação
  const resetToken = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora

  localStorage.setItem(
    `reset_token_${resetToken}`,
    JSON.stringify({ userId: user.id, expiresAt })
  );

  // Em produção, enviaria email com link contendo o token
  console.log(`Reset token para ${email}: ${resetToken}`);

  return true;
}

/**
 * Reseta senha usando token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<boolean> {
  const data = localStorage.getItem(`reset_token_${token}`);
  if (!data) {
    throw new Error('Token inválido ou expirado');
  }

  try {
    const { userId, expiresAt } = JSON.parse(data);
    const expires = new Date(expiresAt);

    if (expires < new Date()) {
      throw new Error('Token expirado');
    }

    if (newPassword.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Salvar nova senha
    localStorage.setItem(`user_password_${userId}`, hashedPassword);

    // Remover token usado
    localStorage.removeItem(`reset_token_${token}`);

    return true;
  } catch (error) {
    throw new Error('Erro ao resetar senha');
  }
}

/**
 * Limpa sessões expiradas
 */
export function cleanExpiredSessions(): void {
  const now = new Date();

  // Iterar sobre todas as chaves do localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('session_token_')) continue;

    const data = localStorage.getItem(key);
    if (!data) continue;

    try {
      const session = JSON.parse(data);
      const expiresAt = new Date(session.expiresAt);

      if (expiresAt < now) {
        localStorage.removeItem(key);
        localStorage.removeItem(`session_${session.userId}`);
      }
    } catch {
      // Remover dados corrompidos
      localStorage.removeItem(key);
    }
  }
}
