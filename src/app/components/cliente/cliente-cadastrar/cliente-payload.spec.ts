import { CASCAVEL, criarCliente } from '../../../testing/dados-teste';
import { clienteParaFormulario, montarPayloadCliente } from './cliente-payload';

describe('cliente-payload', () => {
  it('normaliza o formulário para o formato da API', () => {
    const payload = montarPayloadCliente({
      nome: '  Ana Souza ',
      tipoPessoa: 'PF',
      cpfCnpj: '529.982.247-25',
      telefone: '(45) 99999-0000',
      email: ' ana@empresa.com.br ',
      cep: '85810-000',
      logradouro: ' Rua Paraná ',
      numero: ' 100 ',
      bairro: ' Centro ',
      cidade: CASCAVEL,
    });

    expect(payload).toEqual({
      nome: 'Ana Souza',
      tipoPessoa: 'PF',
      cpfCnpj: '52998224725',
      telefone: '45999990000',
      email: 'ana@empresa.com.br',
      cep: '85810000',
      logradouro: 'Rua Paraná',
      numero: '100',
      bairro: 'Centro',
      cidade: { id: 2853 },
    });
  });

  it('mantém letras do CNPJ alfanumérico em maiúsculas', () => {
    const payload = montarPayloadCliente({
      ...clienteParaFormulario(criarCliente()),
      tipoPessoa: 'PJ',
      cpfCnpj: '12.abc.345/01de-35',
    });
    expect(payload.cpfCnpj).toBe('12ABC34501DE35');
  });

  it('nunca envia a cidade como texto', () => {
    const payload = montarPayloadCliente({
      ...clienteParaFormulario(criarCliente()),
      cidade: 'Cascavel',
    });
    expect(payload.cidade).toBeNull();
  });

  it('converte registros antigos salvos com máscara para o formulário', () => {
    const valores = clienteParaFormulario(
      criarCliente({ cpfCnpj: '529.982.247-25', telefone: '(45) 9 9999-0000', cep: '85810-000' }),
    );
    expect(valores.cpfCnpj).toBe('52998224725');
    expect(valores.telefone).toBe('45999990000');
    expect(valores.cep).toBe('85810000');
  });
});
