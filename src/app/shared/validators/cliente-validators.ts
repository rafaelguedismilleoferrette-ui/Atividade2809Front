import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { cepValido, cnpjValido, cpfValido, telefoneValido } from '../utils/documentos';

const vazio = (valor: unknown): boolean =>
  valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '');

/** Deixa a verificação de vazio para o `Validators.required`. */
function criarValidador(chave: string, valido: (valor: string) => boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (vazio(valor)) {
      return null;
    }
    return valido(String(valor)) ? null : { [chave]: true };
  };
}

export const cpfValidator = criarValidador('cpf', cpfValido);
export const cnpjValidator = criarValidador('cnpj', cnpjValido);
export const telefoneValidator = criarValidador('telefone', telefoneValido);
export const cepValidator = criarValidador('cep', cepValido);

/**
 * E-mail com domínio e extensão (o `Validators.email` do Angular aceita
 * "nome@dominio", sem ponto).
 */
export const emailCompletoValidator = criarValidador('email', (valor) =>
  /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/.test(valor.trim()),
);

/** Impede valores compostos só por espaços. */
export const naoSomenteEspacosValidator: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.length > 0 && control.value.trim() === ''
    ? { required: true }
    : null;

/**
 * O seletor de cidades guarda o texto digitado até que uma opção seja
 * escolhida. Só é válido quando há um objeto com `id`.
 */
export const cidadeSelecionadaValidator: ValidatorFn = (control) => {
  const valor = control.value;
  if (vazio(valor)) {
    return null;
  }
  return typeof valor === 'object' && typeof valor.id === 'number'
    ? null
    : { cidadeNaoSelecionada: true };
};
