import { Component, input } from '@angular/core';
import { ExclamationTriangle } from '@primeicons/angular/exclamation-triangle';
import { Inbox } from '@primeicons/angular/inbox';
import { Search } from '@primeicons/angular/search';

export type TipoEstado = 'vazio' | 'erro' | 'sem-resultados';

/**
 * Mensagem centralizada para listas vazias, buscas sem resultado e falhas
 * de carregamento. As ações (botões) entram por projeção de conteúdo.
 */
@Component({
  selector: 'app-estado-painel',
  imports: [ExclamationTriangle, Inbox, Search],
  template: `
    <div
      class="estado"
      [class.estado--erro]="tipo() === 'erro'"
      [attr.role]="tipo() === 'erro' ? 'alert' : 'status'"
    >
      <span class="estado__icone" aria-hidden="true">
        @switch (tipo()) {
          @case ('erro') {
            <svg data-p-icon="exclamation-triangle" size="28"></svg>
          }
          @case ('sem-resultados') {
            <svg data-p-icon="search" size="28"></svg>
          }
          @default {
            <svg data-p-icon="inbox" size="28"></svg>
          }
        }
      </span>
      <h2 class="estado__titulo">{{ titulo() }}</h2>
      @if (mensagem()) {
        <p class="estado__mensagem">{{ mensagem() }}</p>
      }
      <div class="estado__acoes">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .estado {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--ag-space-2);
      padding: var(--ag-space-10) var(--ag-space-6);
    }
    .estado__icone {
      display: grid;
      place-items: center;
      width: 64px;
      height: 64px;
      margin-bottom: var(--ag-space-2);
      border-radius: 20px;
      color: var(--ag-primary);
      background: var(--ag-primary-soft);
      border: 1px solid var(--ag-glass-border);
    }
    .estado--erro .estado__icone {
      color: var(--ag-danger);
      background: var(--ag-danger-soft);
    }
    .estado__titulo {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 650;
      color: var(--ag-navy);
    }
    .estado__mensagem {
      margin: 0;
      max-width: 52ch;
      color: var(--ag-text-secondary);
    }
    .estado__acoes {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--ag-space-3);
      margin-top: var(--ag-space-3);
    }
    .estado__acoes:empty {
      display: none;
    }
  `,
})
export class EstadoPainel {
  readonly tipo = input<TipoEstado>('vazio');
  readonly titulo = input.required<string>();
  readonly mensagem = input<string>();
}
