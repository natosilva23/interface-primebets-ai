// ============================================
// UTILITÁRIOS: CRIPTOGRAFIA E SEGURANÇA
// ============================================

/**
 * Gera hash de senha usando Web Crypto API
 */
export async function hashPassword(password: string): Promise<string> {
  // Converter senha para ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // Gerar hash SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Converter para string hexadecimal
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Verifica se senha corresponde ao hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Gera token aleatório seguro
 */
export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Gera ID único
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${randomPart}` : `${timestamp}_${randomPart}`;
}

/**
 * Criptografa dados sensíveis (simples XOR para demo)
 * Em produção, usar AES-GCM ou similar
 */
export function encryptData(data: string, key: string): string {
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(encrypted); // Base64 encode
}

/**
 * Descriptografa dados
 */
export function decryptData(encrypted: string, key: string): string {
  const decoded = atob(encrypted); // Base64 decode
  let decrypted = '';
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    decrypted += String.fromCharCode(charCode);
  }
  return decrypted;
}

/**
 * Sanitiza string para prevenir XSS
 */
export function sanitizeString(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Valida força da senha
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Comprimento
  if (password.length >= 8) {
    score += 25;
  } else {
    feedback.push('Use no mínimo 8 caracteres');
  }

  // Letras maiúsculas
  if (/[A-Z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('Adicione letras maiúsculas');
  }

  // Letras minúsculas
  if (/[a-z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('Adicione letras minúsculas');
  }

  // Números
  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Adicione números');
  }

  // Caracteres especiais
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Adicione caracteres especiais');
  }

  return {
    isStrong: score >= 75,
    score,
    feedback,
  };
}

/**
 * Gera senha aleatória forte
 */
export function generateRandomPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = uppercase + lowercase + numbers + special;

  let password = '';

  // Garantir pelo menos um de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Preencher o resto
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Embaralhar
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Rate limiting simples
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Limpa rate limits expirados
 */
export function cleanExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}
