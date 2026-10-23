import { HttpErrorResponse } from '@angular/common/http';

/**
 * Traduz um erro HTTP em uma mensagem para o usuário.
 *
 * O backend usa o tratamento padrão do Spring Boot 2.7: exceções de negócio
 * (cliente não encontrado, CPF/CNPJ duplicado etc.) chegam como HTTP 500 sem
 * mensagem detalhada. Por isso `dicaServidor` permite explicar a causa mais
 * provável em cada operação.
 */
export function mensagemErroHttp(erro: unknown, dicaServidor?: string): string {
  if (!(erro instanceof HttpErrorResponse)) {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  if (erro.status === 0) {
    return 'Não foi possível conectar à API. Verifique se o backend está em execução em http://localhost:8080.';
  }

  if (erro.status === 404) {
    return 'Recurso não encontrado na API (HTTP 404).';
  }

  if (erro.status === 400) {
    return 'A API recusou os dados enviados (HTTP 400). Revise o formulário.';
  }

  if (erro.status === 504 || erro.status === 502 || erro.status === 503) {
    return `A API não respondeu (HTTP ${erro.status}). Verifique se o backend está em execução.`;
  }

  if (erro.status >= 500) {
    const base = `Erro no servidor (HTTP ${erro.status}).`;
    return dicaServidor ? `${base} ${dicaServidor}` : base;
  }

  return `Falha na requisição (HTTP ${erro.status}).`;
}
