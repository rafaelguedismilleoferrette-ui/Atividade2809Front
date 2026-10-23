import { Component, computed, input } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';
import { percentual } from './resumo-clientes';

export interface ItemBarra {
  rotulo: string;
  total: number;
}

/**
 * Barras horizontais de uma única série (uma cor), com valor na ponta.
 * Barras finas (12px), ponta arredondada e base reta.
 */
@Component({
  selector: 'app-grafico-barras',
  imports: [Tooltip],
  template: `
    <ol class="barras">
      @for (item of itens(); track item.rotulo) {
        <li class="barras__item">
          <span class="barras__rotulo" [attr.title]="item.rotulo">{{ item.rotulo }}</span>
          <span
            class="barras__trilho"
            role="img"
            tabindex="0"
            [attr.aria-label]="
              item.rotulo + ': ' + item.total + (item.total === 1 ? ' cliente' : ' clientes')
            "
            [pTooltip]="item.rotulo + ': ' + porcentagem(item.total) + '% do total de clientes'"
            tooltipPosition="top"
            tooltipEvent="both"
          >
            <span class="barras__barra" [style.width.%]="(item.total / maior()) * 100"></span>
          </span>
          <span class="barras__valor" aria-hidden="true">{{ item.total }}</span>
        </li>
      }
    </ol>
  `,
  styles: `
    .barras {
      display: flex;
      flex-direction: column;
      gap: var(--ag-space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .barras__item {
      display: grid;
      grid-template-columns: minmax(0, 11rem) minmax(0, 1fr) 2.5rem;
      align-items: center;
      gap: var(--ag-space-3);
    }
    .barras__rotulo {
      overflow: hidden;
      font-size: 0.875rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .barras__trilho {
      display: block;
      padding: 4px 0;
      border-radius: 4px;
    }
    .barras__barra {
      display: block;
      min-width: 4px;
      height: 12px;
      border-radius: 0 4px 4px 0;
      background: var(--ag-primary);
      transition: filter var(--ag-duration) var(--ag-ease);
    }
    .barras__trilho:hover .barras__barra,
    .barras__trilho:focus-visible .barras__barra {
      filter: brightness(1.15);
    }
    .barras__valor {
      font-weight: 650;
      color: var(--ag-navy);
      font-variant-numeric: tabular-nums;
    }
    @media (max-width: 419.98px) {
      .barras__item {
        grid-template-columns: minmax(0, 7rem) minmax(0, 1fr) 2rem;
      }
    }
  `,
})
export class GraficoBarras {
  readonly itens = input.required<ItemBarra[]>();
  /** Base dos percentuais do tooltip (total de clientes). */
  readonly totalGeral = input.required<number>();

  protected readonly maior = computed(() => Math.max(1, ...this.itens().map((i) => i.total)));

  protected porcentagem(valor: number): number {
    return percentual(valor, this.totalGeral());
  }
}
