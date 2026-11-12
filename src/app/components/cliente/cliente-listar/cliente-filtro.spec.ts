import { CASCAVEL, CLIENTES_TESTE, criarCliente, TOLEDO } from '../../../testing/dados-teste';
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
    expect(filtrarClientes(CLIENTES_TESTE, 'ana souza', 'PJ')).toHaveLength(0);
  });

  it('busca por telefone com máscara e por e-mail', () => {
    const clientes = [
      criarCliente(),
      criarCliente({ id: 2, email: 'contato@loja.com', telefone: '41988887777' }),
    ];
    expect(filtrarClientes(clientes, '(41) 98888-7777', null).map((c) => c.id)).toEqual([2]);
    expect(filtrarClientes(clientes, 'CONTATO@LOJA', null).map((c) => c.id)).toEqual([2]);
    expect(filtrarClientes(clientes, 'empresa.com', null).map((c) => c.id)).toEqual([1]);
  });

  it('combina cidade e UF e separa cidades de mesmo nome pelo ID', () => {
    const clientes = [
      criarCliente(),
      criarCliente({ id: 2, cidade: TOLEDO }),
      criarCliente({
        id: 3,
        cidade: { ...CASCAVEL, id: 55, estado: { id: 1, nome: 'Ceará', uf: 'CE', ibge: 23 } },
      }),
    ];
    expect(filtrarClientes(clientes, '', null, CASCAVEL.id, 'PR').map((c) => c.id)).toEqual([1]);
    expect(filtrarClientes(clientes, '', null, null, 'CE').map((c) => c.id)).toEqual([3]);
    expect(filtrarClientes(clientes, '', null, CASCAVEL.id, 'CE')).toHaveLength(0);
  });

  it('considera campos vazios e cidade ausente como cadastro incompleto', () => {
    const clientes = [
      criarCliente(),
      criarCliente({ id: 2, email: '  ' }),
      criarCliente({ id: 3, cidade: null }),
      criarCliente({ id: 4, telefone: null }),
    ];
    expect(filtrarClientes(clientes, '', null, null, null, true).map((c) => c.id)).toEqual([
      2, 3, 4,
    ]);
  });
});
