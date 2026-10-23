import { Cidade } from '../core/models/cidade.model';
import { Cliente } from '../core/models/cliente.model';

/** Fixtures usados apenas nos testes unitários. */
export const CASCAVEL: Cidade = {
  id: 2853,
  nome: 'Cascavel',
  ibge: 4104808,
  estado: { id: 18, nome: 'Paraná', uf: 'PR', ibge: 41 },
};

export const TOLEDO: Cidade = {
  id: 3164,
  nome: 'Toledo',
  ibge: 4127700,
  estado: { id: 18, nome: 'Paraná', uf: 'PR', ibge: 41 },
};

export function criarCliente(parcial: Partial<Cliente> = {}): Cliente {
  return {
    id: 1,
    nome: 'Ana Souza',
    tipoPessoa: 'PF',
    cpfCnpj: '52998224725',
    telefone: '45999990000',
    email: 'ana@empresa.com.br',
    logradouro: 'Rua Paraná',
    numero: '100',
    bairro: 'Centro',
    cep: '85810000',
    cidade: CASCAVEL,
    ...parcial,
  };
}

export const CLIENTES_TESTE: Cliente[] = [
  criarCliente(),
  criarCliente({
    id: 2,
    nome: 'José Pereira',
    cpfCnpj: '11144477735',
    cidade: TOLEDO,
  }),
  criarCliente({
    id: 3,
    nome: 'Auto Peças Oeste Ltda',
    tipoPessoa: 'PJ',
    cpfCnpj: '11222333000181',
    cidade: CASCAVEL,
  }),
  criarCliente({ id: 4, nome: 'Cliente Antigo', tipoPessoa: null, cpfCnpj: null, cidade: null }),
];
