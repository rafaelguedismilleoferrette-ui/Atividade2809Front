import { CLIENTES_TESTE } from '../../testing/dados-teste';
import { calcularResumo, percentual } from './resumo-clientes';

describe('calcularResumo', () => {
  it('conta PF, PJ, sem tipo e sem cidade', () => {
    const r = calcularResumo(CLIENTES_TESTE);
    expect(r.total).toBe(4);
    expect(r.pessoasFisicas).toBe(2);
    expect(r.pessoasJuridicas).toBe(1);
    expect(r.semTipo).toBe(1);
    expect(r.semCidade).toBe(1);
  });

  it('ordena as cidades pela quantidade de clientes', () => {
    const r = calcularResumo(CLIENTES_TESTE);
    expect(r.principaisCidades).toEqual([
      { rotulo: 'Cascavel - PR', total: 2 },
      { rotulo: 'Toledo - PR', total: 1 },
    ]);
  });

  it('lista os cadastros mais recentes primeiro (maior id)', () => {
    const r = calcularResumo(CLIENTES_TESTE, 2);
    expect(r.recentes.map((c) => c.id)).toEqual([4, 3]);
  });

  it('funciona com lista vazia', () => {
    const r = calcularResumo([]);
    expect(r.total).toBe(0);
    expect(r.principaisCidades).toEqual([]);
    expect(percentual(0, 0)).toBe(0);
  });
});
