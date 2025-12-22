// ============================================
// UTILITÁRIOS: VALIDAÇÕES
// ============================================

/**
 * Valida email
 */
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email) {
    return { isValid: false, error: 'Email é obrigatório' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email inválido' };
  }

  return { isValid: true };
}

/**
 * Valida senha
 */
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (!password) {
    return { isValid: false, error: 'Senha é obrigatória' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Senha deve ter no mínimo 6 caracteres' };
  }

  return { isValid: true };
}

/**
 * Valida nome
 */
export function validateName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name) {
    return { isValid: false, error: 'Nome é obrigatório' };
  }

  if (name.length < 2) {
    return { isValid: false, error: 'Nome deve ter no mínimo 2 caracteres' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Nome muito longo' };
  }

  return { isValid: true };
}

/**
 * Valida valor de aposta
 */
export function validateStake(stake: number): {
  isValid: boolean;
  error?: string;
} {
  if (!stake || stake <= 0) {
    return { isValid: false, error: 'Valor deve ser maior que zero' };
  }

  if (stake > 10000) {
    return { isValid: false, error: 'Valor máximo é R$ 10.000' };
  }

  return { isValid: true };
}

/**
 * Valida odds
 */
export function validateOdds(odds: number): {
  isValid: boolean;
  error?: string;
} {
  if (!odds || odds < 1.01) {
    return { isValid: false, error: 'Odds deve ser no mínimo 1.01' };
  }

  if (odds > 1000) {
    return { isValid: false, error: 'Odds muito alta' };
  }

  return { isValid: true };
}

/**
 * Valida data
 */
export function validateDate(date: Date | string): {
  isValid: boolean;
  error?: string;
} {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Data inválida' };
  }

  return { isValid: true };
}

/**
 * Valida CPF (brasileiro)
 */
export function validateCPF(cpf: string): {
  isValid: boolean;
  error?: string;
} {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) {
    return { isValid: false, error: 'CPF deve ter 11 dígitos' };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) {
    return { isValid: false, error: 'CPF inválido' };
  }

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) {
    return { isValid: false, error: 'CPF inválido' };
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) {
    return { isValid: false, error: 'CPF inválido' };
  }

  return { isValid: true };
}

/**
 * Valida telefone brasileiro
 */
export function validatePhone(phone: string): {
  isValid: boolean;
  error?: string;
} {
  // Remove caracteres não numéricos
  phone = phone.replace(/[^\d]/g, '');

  if (phone.length < 10 || phone.length > 11) {
    return { isValid: false, error: 'Telefone inválido' };
  }

  return { isValid: true };
}

/**
 * Valida cartão de crédito (Luhn algorithm)
 */
export function validateCreditCard(cardNumber: string): {
  isValid: boolean;
  error?: string;
} {
  // Remove espaços e hífens
  cardNumber = cardNumber.replace(/[\s-]/g, '');

  if (!/^\d+$/.test(cardNumber)) {
    return { isValid: false, error: 'Número do cartão deve conter apenas dígitos' };
  }

  if (cardNumber.length < 13 || cardNumber.length > 19) {
    return { isValid: false, error: 'Número do cartão inválido' };
  }

  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    return { isValid: false, error: 'Número do cartão inválido' };
  }

  return { isValid: true };
}

/**
 * Valida CVV
 */
export function validateCVV(cvv: string): {
  isValid: boolean;
  error?: string;
} {
  if (!/^\d{3,4}$/.test(cvv)) {
    return { isValid: false, error: 'CVV deve ter 3 ou 4 dígitos' };
  }

  return { isValid: true };
}

/**
 * Valida data de expiração do cartão
 */
export function validateCardExpiry(month: string, year: string): {
  isValid: boolean;
  error?: string;
} {
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return { isValid: false, error: 'Mês inválido' };
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100; // Últimos 2 dígitos
  const currentMonth = now.getMonth() + 1;

  if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
    return { isValid: false, error: 'Cartão expirado' };
  }

  return { isValid: true };
}

/**
 * Valida URL
 */
export function validateURL(url: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'URL inválida' };
  }
}

/**
 * Valida range numérico
 */
export function validateRange(
  value: number,
  min: number,
  max: number
): {
  isValid: boolean;
  error?: string;
} {
  if (value < min || value > max) {
    return {
      isValid: false,
      error: `Valor deve estar entre ${min} e ${max}`,
    };
  }

  return { isValid: true };
}

/**
 * Valida formato de data brasileira (DD/MM/YYYY)
 */
export function validateBrazilianDate(date: string): {
  isValid: boolean;
  error?: string;
} {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = date.match(dateRegex);

  if (!match) {
    return { isValid: false, error: 'Formato deve ser DD/MM/YYYY' };
  }

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Mês inválido' };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return { isValid: false, error: 'Dia inválido' };
  }

  return { isValid: true };
}
