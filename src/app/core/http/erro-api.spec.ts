import { HttpErrorResponse } from '@angular/common/http';
import { mensagemErroHttp } from './erro-api';

describe('mensagemErroHttp', () => {
  it('explica quando a API está fora do ar (status 0)', () => {
    expect(mensagemErroHttp(new HttpErrorResponse({ status: 0 }))).toContain(
      'Não foi possível conectar à API',
    );
  });

  it('acrescenta a dica da operação em erros 500', () => {
    const msg = mensagemErroHttp(new HttpErrorResponse({ status: 500 }), 'CPF duplicado?');
    expect(msg).toBe('Erro no servidor (HTTP 500). CPF duplicado?');
  });

  it('trata proxy sem backend (504) como API indisponível', () => {
    expect(mensagemErroHttp(new HttpErrorResponse({ status: 504 }))).toContain('não respondeu');
  });

  it('usa mensagem genérica para erros que não são HTTP', () => {
    expect(mensagemErroHttp(new Error('x'))).toBe('Ocorreu um erro inesperado. Tente novamente.');
  });
});
