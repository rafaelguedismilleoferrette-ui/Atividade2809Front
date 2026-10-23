import { Component, input } from '@angular/core';

/**
 * Título e subtítulo padronizados de cada tela, com área de ações à direita.
 *
 * ```html
 * <app-cabecalho-pagina titulo="Clientes" subtitulo="...">
 *   <a pButton routerLink="novo">Novo cliente</a>
 * </app-cabecalho-pagina>
 * ```
 */
@Component({
  selector: 'app-cabecalho-pagina',
  template: `
    <div class="cabecalho-pagina">
      <div class="cabecalho-pagina__textos">
        @if (sobretitulo()) {
          <p class="cabecalho-pagina__sobretitulo">{{ sobretitulo() }}</p>
        }
        <h1 class="cabecalho-pagina__titulo" tabindex="-1">{{ titulo() }}</h1>
        @if (subtitulo()) {
          <p class="cabecalho-pagina__subtitulo">{{ subtitulo() }}</p>
        }
      </div>
      <div class="cabecalho-pagina__acoes">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .cabecalho-pagina {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--ag-space-4);
      margin-bottom: var(--ag-space-6);
    }
    .cabecalho-pagina__sobretitulo {
      margin: 0 0 var(--ag-space-1);
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--ag-primary);
    }
    .cabecalho-pagina__titulo {
      margin: 0;
      font-size: clamp(1.5rem, 1.2rem + 1vw, 2rem);
      font-weight: 700;
      line-height: 1.2;
      color: var(--ag-navy);
      outline: none;
    }
    .cabecalho-pagina__subtitulo {
      margin: var(--ag-space-2) 0 0;
      max-width: 62ch;
      color: var(--ag-text-secondary);
    }
    .cabecalho-pagina__acoes {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ag-space-3);
    }
    .cabecalho-pagina__acoes:empty {
      display: none;
    }
    @media (max-width: 575.98px) {
      .cabecalho-pagina__acoes {
        width: 100%;
      }
      .cabecalho-pagina__acoes ::ng-deep > * {
        flex: 1 1 auto;
      }
    }
  `,
})
export class CabecalhoPagina {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>();
  readonly sobretitulo = input<string>();
}
