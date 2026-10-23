/**
 * Espelha a entidade `Estado` do backend (tabela `estado`).
 */
export interface Estado {
  id: number;
  nome: string;
  uf: string;
  ibge: number | null;
}

/**
 * Espelha a entidade `Cidade` do backend (tabela `cidade`).
 * O relacionamento com `Estado` é carregado junto (ManyToOne EAGER).
 */
export interface Cidade {
  id: number;
  nome: string;
  estado: Estado | null;
  ibge: number | null;
}

/** Texto padrão para exibir uma cidade: "Cascavel - PR". */
export function rotuloCidade(cidade: Cidade | null | undefined): string {
  if (!cidade?.nome) {
    return '';
  }
  return cidade.estado?.uf ? `${cidade.nome} - ${cidade.estado.uf}` : cidade.nome;
}
