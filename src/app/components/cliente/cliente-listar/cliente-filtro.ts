import { Cliente, TipoPessoa } from '../../../core/models/cliente.model';
import { normalizarCnpj, somenteDigitos } from '../../../shared/utils/documentos';

export const normalizarTexto = (texto: string | null | undefined): string =>
  (texto ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

export function cadastroIncompleto(cliente: Cliente): boolean {
  const campos = [
    cliente.nome,
    cliente.tipoPessoa,
    cliente.cpfCnpj,
    cliente.telefone,
    cliente.email,
    cliente.logradouro,
    cliente.numero,
    cliente.bairro,
    cliente.cep,
  ];
  return campos.some((campo) => !campo?.trim()) || !cliente.cidade?.id;
}

export function filtrarClientes(
  clientes: readonly Cliente[],
  termo: string,
  tipo: TipoPessoa | null,
  cidadeId: number | null = null,
  uf: string | null = null,
  somenteIncompletos = false,
): Cliente[] {
  const texto = normalizarTexto(termo);
  const documento = /\d/.test(termo) ? normalizarCnpj(termo) : '';
  const telefone = /^[\d\s()+.-]+$/.test(termo) ? somenteDigitos(termo) : '';

  return clientes.filter((cliente) => {
    if (tipo && cliente.tipoPessoa !== tipo) {
      return false;
    }
    if (cidadeId !== null && cliente.cidade?.id !== cidadeId) return false;
    if (uf && cliente.cidade?.estado?.uf !== uf) return false;
    if (somenteIncompletos && !cadastroIncompleto(cliente)) return false;
    if (!texto) {
      return true;
    }
    return (
      normalizarTexto(cliente.nome).includes(texto) ||
      normalizarTexto(cliente.email).includes(texto) ||
      (documento.length > 0 && normalizarCnpj(cliente.cpfCnpj).includes(documento)) ||
      (telefone.length > 0 && somenteDigitos(cliente.telefone).includes(telefone))
    );
  });
}
