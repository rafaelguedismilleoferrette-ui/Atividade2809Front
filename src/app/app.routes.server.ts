import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Todas as telas dependem de dados ao vivo da API (que não tem CORS e só
 * existe em tempo de execução), então são renderizadas no navegador.
 * Pré-renderizar faria o build tentar chamar o backend e congelaria dados.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
