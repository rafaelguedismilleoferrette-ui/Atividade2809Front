import { Cidade } from '../../../core/models/cidade.model';
import { Cliente, ClientePayload, TipoPessoa } from '../../../core/models/cliente.model';
import { normalizarPorMascara, somenteDigitos } from '../../../shared/utils/documentos';

/** Valores do formulário de cliente (`getRawValue()`). */
export interface ValorFormularioCliente {
  nome: string;
  tipoPessoa: TipoPessoa | null;
  cpfCnpj: string;
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: Cidade | string | null;
}

export const tipoMascaraDocumento = (tipo: TipoPessoa | null): 'cpf' | 'cnpj' =>
  tipo === 'PJ' ? 'cnpj' : 'cpf';

/**
 * Converte o formulário no corpo aceito pela API: textos sem espaços nas
 * pontas, documentos/telefone/CEP sem máscara e cidade como `{ id }`.
 */
export function montarPayloadCliente(valor: ValorFormularioCliente): ClientePayload {
  if (!valor.tipoPessoa) {
    throw new Error('Tipo de pessoa é obrigatório.');
  }
  const cidade = typeof valor.cidade === 'object' && valor.cidade ? { id: valor.cidade.id } : null;

  return {
    nome: valor.nome.trim(),
    tipoPessoa: valor.tipoPessoa,
    cpfCnpj: normalizarPorMascara(tipoMascaraDocumento(valor.tipoPessoa), valor.cpfCnpj),
    telefone: somenteDigitos(valor.telefone),
    email: valor.email.trim(),
    logradouro: valor.logradouro.trim(),
    numero: valor.numero.trim(),
    bairro: valor.bairro.trim(),
    cep: somenteDigitos(valor.cep),
    cidade,
  };
}

/** Converte um cliente da API nos valores do formulário (modo edição). */
export function clienteParaFormulario(cliente: Cliente): ValorFormularioCliente {
  return {
    nome: cliente.nome ?? '',
    tipoPessoa: cliente.tipoPessoa,
    cpfCnpj: normalizarPorMascara(tipoMascaraDocumento(cliente.tipoPessoa), cliente.cpfCnpj),
    telefone: normalizarPorMascara('telefone', cliente.telefone),
    email: cliente.email ?? '',
    cep: normalizarPorMascara('cep', cliente.cep),
    logradouro: cliente.logradouro ?? '',
    numero: cliente.numero ?? '',
    bairro: cliente.bairro ?? '',
    cidade: cliente.cidade,
  };
}
