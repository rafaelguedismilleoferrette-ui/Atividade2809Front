/**
 * Configuração de produção (`ng build`).
 *
 * O backend Spring Boot não possui configuração de CORS. Para servir o build
 * em outro domínio/porta é preciso liberar a origem no backend ou publicar a
 * API atrás do mesmo domínio (proxy reverso) e trocar `apiUrl` para `/api`.
 */
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080',
  /** Chave da licença PrimeUI (Community ou Commercial). Vazio = sem licença. */
  primeuiLicense: '',
};
