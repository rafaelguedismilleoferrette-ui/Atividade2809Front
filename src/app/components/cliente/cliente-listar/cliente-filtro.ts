import { Cliente, TipoPessoa } from '../../../core/models/cliente.model';
import { normalizarCnpj } from '../../../shared/utils/documentos';

/** Minúsculas e sem acentos: "José" e "jose" se equivalem na busca. */
export const normalizarTexto = (texto: string | null | undefined): string =>
  (texto ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

/**
 * Filtro feito no navegador, pois `GET /clientes/listar-clientes` devolve a
 * lista completa. Busca por nome (sem acentos) ou CPF/CNPJ (com ou sem máscara).
 */
export function filtrarClientes(
  clientes: readonly Cliente[],
  termo: string,
  tipo: TipoPessoa | null,
): Cliente[] {
  const texto = normalizarTexto(termo);
  // Só compara documento quando há algum dígito, para "Ana" não casar com CNPJs alfanuméricos.
  const documento = /\d/.test(termo) ? normalizarCnpj(termo) : '';

  return clientes.filter((cliente) => {
    if (tipo && cliente.tipoPessoa !== tipo) {
      return false;
    }
    if (!texto) {
      return true;
    }
    return (
      normalizarTexto(cliente.nome).includes(texto) ||
      (documento.length > 0 && normalizarCnpj(cliente.cpfCnpj).includes(documento))
    );
  });
}
