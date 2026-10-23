/**
 * Normalização, formatação e validação de CPF, CNPJ, telefone e CEP.
 *
 * Os valores são enviados à API sem máscara (somente dígitos; no CNPJ,
 * dígitos e letras maiúsculas), o que mantém a coluna `cpfCnpj` (UNIQUE)
 * consistente independentemente de como o usuário digitou.
 */

export type TipoMascara = 'cpf' | 'cnpj' | 'telefone' | 'cep';

export const somenteDigitos = (valor: string | null | undefined): string =>
  (valor ?? '').replace(/\D/g, '');

/** CNPJ alfanumérico (IN RFB 2.229/2024): 12 posições [A-Z0-9] + 2 DVs numéricos. */
export const normalizarCnpj = (valor: string | null | undefined): string =>
  (valor ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '');

/** Mantém apenas os caracteres que a máscara aceita, no limite de tamanho. */
export function normalizarPorMascara(tipo: TipoMascara, valor: string | null | undefined): string {
  switch (tipo) {
    case 'cpf':
      return somenteDigitos(valor).slice(0, 11);
    case 'cnpj': {
      const bruto = normalizarCnpj(valor);
      // As duas últimas posições (DV) são sempre numéricas.
      const base = bruto.slice(0, 12);
      const dv = somenteDigitos(bruto.slice(12)).slice(0, 2);
      return base + dv;
    }
    case 'telefone':
      return somenteDigitos(valor).slice(0, 11);
    case 'cep':
      return somenteDigitos(valor).slice(0, 8);
  }
}

function aplicarPadrao(valor: string, padrao: string): string {
  let resultado = '';
  let i = 0;
  for (const simbolo of padrao) {
    if (i >= valor.length) {
      break;
    }
    if (simbolo === '#') {
      resultado += valor[i++];
    } else {
      resultado += simbolo;
    }
  }
  return resultado;
}

/** Formata progressivamente (útil durante a digitação). */
export function formatarPorMascara(tipo: TipoMascara, valor: string | null | undefined): string {
  const limpo = normalizarPorMascara(tipo, valor);
  switch (tipo) {
    case 'cpf':
      return aplicarPadrao(limpo, '###.###.###-##');
    case 'cnpj':
      return aplicarPadrao(limpo, '##.###.###/####-##');
    case 'telefone':
      return limpo.length > 10
        ? aplicarPadrao(limpo, '(##) #####-####')
        : aplicarPadrao(limpo, '(##) ####-####');
    case 'cep':
      return aplicarPadrao(limpo, '#####-###');
  }
}

/** Tamanho máximo do texto já formatado (atributo `maxlength`). */
export const TAMANHO_FORMATADO: Record<TipoMascara, number> = {
  cpf: 14,
  cnpj: 18,
  telefone: 15,
  cep: 9,
};

export function cpfValido(valor: string | null | undefined): boolean {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  const digito = (tamanho: number): number => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(cpf[i]) * (tamanho + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10]);
}

/**
 * Valida CNPJ numérico e alfanumérico. Cada caractere vale
 * `código ASCII - 48` ("0".."9" = 0..9, "A" = 17 ... "Z" = 42),
 * com os mesmos pesos do módulo 11 tradicional.
 */
export function cnpjValido(valor: string | null | undefined): boolean {
  const cnpj = normalizarCnpj(valor);
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }
  const valores = [...cnpj].map((c) => c.charCodeAt(0) - 48);
  const digito = (tamanho: number): number => {
    const pesos =
      tamanho === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = pesos.reduce((total, peso, i) => total + valores[i] * peso, 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return digito(12) === valores[12] && digito(13) === valores[13];
}

/** Fixo (10 dígitos) ou celular (11 dígitos, começando com 9), com DDD válido. */
export function telefoneValido(valor: string | null | undefined): boolean {
  const tel = somenteDigitos(valor);
  if (tel.length !== 10 && tel.length !== 11) {
    return false;
  }
  if (!/^[1-9][1-9]/.test(tel)) {
    return false;
  }
  return tel.length === 10 || tel[2] === '9';
}

export const cepValido = (valor: string | null | undefined): boolean =>
  somenteDigitos(valor).length === 8;

/** Formata CPF ou CNPJ já salvo, para exibição (decide pelo tamanho). */
export function formatarDocumento(valor: string | null | undefined): string {
  const limpo = normalizarCnpj(valor);
  if (!limpo) {
    return '';
  }
  if (/^\d{11}$/.test(limpo)) {
    return formatarPorMascara('cpf', limpo);
  }
  if (limpo.length === 14) {
    return formatarPorMascara('cnpj', limpo);
  }
  return valor ?? '';
}

/** Formata telefone salvo; valores fora do padrão são exibidos como vieram. */
export function formatarTelefone(valor: string | null | undefined): string {
  const limpo = somenteDigitos(valor);
  return limpo.length === 10 || limpo.length === 11
    ? formatarPorMascara('telefone', limpo)
    : (valor ?? '');
}

export function formatarCep(valor: string | null | undefined): string {
  const limpo = somenteDigitos(valor);
  return limpo.length === 8 ? formatarPorMascara('cep', limpo) : (valor ?? '');
}
