import { Cidade } from './cidade.model';

/** Valores do enum `TipoPessoa` do backend. */
export type TipoPessoa = 'PF' | 'PJ';

export const TIPOS_PESSOA: ReadonlyArray<{ descricao: string; valor: TipoPessoa }> = [
  { descricao: 'Pessoa Física', valor: 'PF' },
  { descricao: 'Pessoa Jurídica', valor: 'PJ' },
];

/**
 * Cliente como retornado pela API (`GET /clientes/...`).
 * Apenas `nome` é obrigatório no banco; os demais campos podem vir nulos
 * em registros antigos.
 */
export interface Cliente {
  id: number;
  nome: string;
  tipoPessoa: TipoPessoa | null;
  cpfCnpj: string | null;
  telefone: string | null;
  email: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cep: string | null;
  cidade: Cidade | null;
}

/**
 * Corpo enviado em `POST /clientes/salvar-cliente` e
 * `PUT /clientes/atualizar-cliente/{id}`.
 *
 * `cidade` é um relacionamento JPA (`@ManyToOne`): o backend espera um objeto
 * com o `id` de uma cidade existente, não o nome em texto.
 */
export interface ClientePayload {
  nome: string;
  tipoPessoa: TipoPessoa;
  cpfCnpj: string;
  telefone: string;
  email: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: { id: number } | null;
}
