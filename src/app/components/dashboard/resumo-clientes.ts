import { rotuloCidade } from '../../core/models/cidade.model';
import { Cliente } from '../../core/models/cliente.model';

export interface CidadeResumo {
  rotulo: string;
  total: number;
}

/** Indicadores do dashboard, todos derivados de `GET /clientes/listar-clientes`. */
export interface ResumoClientes {
  total: number;
  pessoasFisicas: number;
  pessoasJuridicas: number;
  /** Registros antigos podem não ter tipo de pessoa. */
  semTipo: number;
  semCidade: number;
  /** Maiores IDs primeiro: o ID é gerado em sequência pelo banco. */
  recentes: Cliente[];
  principaisCidades: CidadeResumo[];
}

export function calcularResumo(clientes: readonly Cliente[], limite = 5): ResumoClientes {
  const porCidade = new Map<number, CidadeResumo>();
  let pessoasFisicas = 0;
  let pessoasJuridicas = 0;
  let semCidade = 0;

  for (const cliente of clientes) {
    if (cliente.tipoPessoa === 'PF') {
      pessoasFisicas++;
    } else if (cliente.tipoPessoa === 'PJ') {
      pessoasJuridicas++;
    }

    if (cliente.cidade?.id == null) {
      semCidade++;
    } else {
      const atual = porCidade.get(cliente.cidade.id);
      if (atual) {
        atual.total++;
      } else {
        porCidade.set(cliente.cidade.id, { rotulo: rotuloCidade(cliente.cidade), total: 1 });
      }
    }
  }

  const principaisCidades = [...porCidade.values()]
    .sort((a, b) => b.total - a.total || a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
    .slice(0, limite);

  const recentes = [...clientes].sort((a, b) => b.id - a.id).slice(0, limite);

  return {
    total: clientes.length,
    pessoasFisicas,
    pessoasJuridicas,
    semTipo: clientes.length - pessoasFisicas - pessoasJuridicas,
    semCidade,
    recentes,
    principaisCidades,
  };
}

/** Percentual inteiro (0–100) com proteção para total zero. */
export const percentual = (parte: number, total: number): number =>
  total > 0 ? Math.round((parte / total) * 100) : 0;
