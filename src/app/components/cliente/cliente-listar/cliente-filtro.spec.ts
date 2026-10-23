import { CLIENTES_TESTE } from '../../../testing/dados-teste';
import { filtrarClientes } from './cliente-filtro';

const nomes = (lista: { nome: string }[]) => lista.map((c) => c.nome);

describe('filtrarClientes', () => {
  it('sem filtros devolve todos', () => {
    expect(filtrarClientes(CLIENTES_TESTE, '', null)).toHaveLength(4);
  });

  it('busca por nome ignorando acentos e maiúsculas', () => {
    expect(nomes(filtrarClientes(CLIENTES_TESTE, 'jose', null))).toEqual(['José Pereira']);
    expect(nomes(filtrarClientes(CLIENTES_TESTE, 'PEÇAS', null))).toEqual([
      'Auto Peças Oeste Ltda',
    ]);
  });

  it('busca por CPF/CNPJ com ou sem pontuação', () => {
    expect(nomes(filtrarClientes(CLIENTES_TESTE, '529.982', null))).toEqual(['Ana Souza']);
    expect(nomes(filtrarClientes(CLIENTES_TESTE, '11222333', null))).toEqual([
      'Auto Peças Oeste Ltda',
    ]);
  });

  it('filtra por tipo de pessoa e combina com a busca', () => {
    expect(filtrarClientes(CLIENTES_TESTE, '', 'PJ')).toHaveLength(1);
    expect(filtrarClientes(CLIENTES_TESTE, '', 'PF')).toHaveLength(2);
    expect(filtrarClientes(CLIENTES_TESTE, 'ana', 'PJ')).toHaveLength(0);
  });
});
