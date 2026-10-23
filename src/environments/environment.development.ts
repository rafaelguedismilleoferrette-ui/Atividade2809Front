/**
 * Configuração de desenvolvimento (`ng serve`).
 *
 * As chamadas usam o prefixo `/api`, que o dev server do Angular redireciona
 * para o Spring Boot em http://localhost:8080 (ver `proxy.conf.json`). Assim o
 * navegador enxerga a mesma origem e não há bloqueio de CORS.
 */
export const environment = {
  production: false,
  apiUrl: '/api',
  /** Chave da licença PrimeUI (Community ou Commercial). Vazio = sem licença. */
  primeuiLicense: '',
};
