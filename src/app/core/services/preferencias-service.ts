import { isPlatformBrowser } from '@angular/common';
import { effect, inject, PLATFORM_ID, Service, signal } from '@angular/core';

export const OPCOES_ITENS_POR_PAGINA = [5, 10, 20, 50] as const;

interface Preferencias {
  menuRecolhido: boolean;
  itensPorPagina: number;
}

const CHAVE = 'auto-gestao:preferencias';
const PADRAO: Preferencias = { menuRecolhido: false, itensPorPagina: 10 };

/**
 * Preferências da interface salvas no navegador (localStorage).
 * Não há endpoint de configurações no backend, então nada disso sai da máquina.
 */
@Service()
export class PreferenciasService {
  private readonly noNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly iniciais = this.ler();

  /** No desktop, iniciar com o menu lateral recolhido (somente ícones). */
  readonly menuRecolhido = signal(this.iniciais.menuRecolhido);
  /** Quantidade padrão de linhas por página nas tabelas. */
  readonly itensPorPagina = signal(this.iniciais.itensPorPagina);

  constructor() {
    effect(() => {
      this.gravar({ menuRecolhido: this.menuRecolhido(), itensPorPagina: this.itensPorPagina() });
    });
  }

  restaurarPadrao(): void {
    this.menuRecolhido.set(PADRAO.menuRecolhido);
    this.itensPorPagina.set(PADRAO.itensPorPagina);
  }

  private ler(): Preferencias {
    if (!this.noNavegador) {
      return { ...PADRAO };
    }
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? '{}') as Partial<Preferencias>;
      const itens = Number(salvo.itensPorPagina);
      return {
        menuRecolhido: salvo.menuRecolhido === true,
        itensPorPagina: (OPCOES_ITENS_POR_PAGINA as readonly number[]).includes(itens)
          ? itens
          : PADRAO.itensPorPagina,
      };
    } catch {
      return { ...PADRAO };
    }
  }

  private gravar(preferencias: Preferencias): void {
    if (!this.noNavegador) {
      return;
    }
    try {
      localStorage.setItem(CHAVE, JSON.stringify(preferencias));
    } catch {
      // Armazenamento bloqueado (modo privado etc.): mantém só em memória.
    }
  }
}
