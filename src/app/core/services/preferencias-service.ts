import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { effect, inject, PLATFORM_ID, Service, signal } from '@angular/core';

export const OPCOES_ITENS_POR_PAGINA = [5, 10, 20, 50] as const;

interface Preferencias {
  menuRecolhido: boolean;
  itensPorPagina: number;
  modoEscuro: boolean;
}

const CHAVE = 'auto-gestao:preferencias';
const PADRAO: Preferencias = { menuRecolhido: false, itensPorPagina: 10, modoEscuro: false };

@Service()
export class PreferenciasService {
  private readonly noNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly documento = inject(DOCUMENT);
  private readonly iniciais = this.ler();

  readonly menuRecolhido = signal(this.iniciais.menuRecolhido);
  readonly itensPorPagina = signal(this.iniciais.itensPorPagina);
  readonly modoEscuro = signal(this.iniciais.modoEscuro);

  constructor() {
    effect(() => {
      this.documento.documentElement.classList.toggle('modo-escuro', this.modoEscuro());
      this.gravar({
        menuRecolhido: this.menuRecolhido(),
        itensPorPagina: this.itensPorPagina(),
        modoEscuro: this.modoEscuro(),
      });
    });
  }

  restaurarPadrao(): void {
    this.menuRecolhido.set(PADRAO.menuRecolhido);
    this.itensPorPagina.set(PADRAO.itensPorPagina);
    this.modoEscuro.set(PADRAO.modoEscuro);
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
        modoEscuro: salvo.modoEscuro === true,
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
    } catch {}
  }
}
