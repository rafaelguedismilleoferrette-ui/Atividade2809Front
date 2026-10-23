import { Component, input } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';

export interface SegmentoComposicao {
  chave: 'pf' | 'pj' | 'sem-tipo';
  rotulo: string;
  total: number;
  percentual: number;
}

export function descreverSegmento(segmento: SegmentoComposicao): string {
  const unidade = segmento.total === 1 ? 'cliente' : 'clientes';
  return `${segmento.rotulo}: ${segmento.total} ${unidade} (${segmento.percentual}%)`;
}

/**
 * Barra empilhada 100% (parte do todo) com legenda sempre visível.
 * Cores validadas com o validador de paleta da skill de dataviz:
 * PF #3a6fb0 e PJ #159a8c passam luminosidade, croma, CVD e contraste.
 */
@Component({
  selector: 'app-grafico-composicao',
  imports: [Tooltip],
  template: `
    <div class="barra" role="group" aria-label="Barra de composição por tipo de pessoa">
      @for (s of segmentos(); track s.chave) {
        <span
          class="barra__segmento barra__segmento--{{ s.chave }}"
          [style.flex-grow]="s.total"
          role="img"
          tabindex="0"
          [attr.aria-label]="descrever(s)"
          [pTooltip]="descrever(s)"
          tooltipPosition="top"
          tooltipEvent="both"
        ></span>
      }
    </div>
    <ul class="legenda" aria-label="Legenda">
      @for (s of segmentos(); track s.chave) {
        <li class="legenda__item">
          <span class="legenda__amostra barra__segmento--{{ s.chave }}" aria-hidden="true"></span>
          <span>{{ s.rotulo }}</span>
          <span class="legenda__valor">{{ s.total }} · {{ s.percentual }}%</span>
        </li>
      }
    </ul>
  `,
  styles: `
    .barra {
      display: flex;
      gap: 2px; /* espaço de superfície entre segmentos */
      height: 20px;
      margin-bottom: var(--ag-space-5);
    }
    .barra__segmento {
      min-width: 6px;
      flex-basis: 0;
      transition: filter var(--ag-duration) var(--ag-ease);
    }
    .barra__segmento:first-child {
      border-radius: 4px 0 0 4px;
    }
    .barra__segmento:last-child {
      border-radius: 0 4px 4px 0;
    }
    .barra__segmento:only-child {
      border-radius: 4px;
    }
    .barra__segmento:hover,
    .barra__segmento:focus-visible {
      filter: brightness(1.12);
    }
    .barra__segmento--pf {
      background: #3a6fb0;
    }
    .barra__segmento--pj {
      background: #159a8c;
    }
    .barra__segmento--sem-tipo {
      background: #a3afbd;
    }
    .legenda {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ag-space-3) var(--ag-space-6);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .legenda__item {
      display: flex;
      align-items: center;
      gap: var(--ag-space-2);
    }
    .legenda__amostra {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }
    .legenda__valor {
      font-weight: 650;
      color: var(--ag-navy);
    }
  `,
})
export class GraficoComposicao {
  readonly segmentos = input.required<SegmentoComposicao[]>();
  protected readonly descrever = descreverSegmento;
}
