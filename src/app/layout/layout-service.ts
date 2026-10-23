import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, DestroyRef, effect, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { PreferenciasService } from '../core/services/preferencias-service';

/** Abaixo desta largura o menu vira gaveta (celular e tablet em retrato). */
export const LARGURA_MODO_GAVETA = 992;
/** A partir desta largura o menu começa expandido no desktop. */
export const LARGURA_MENU_EXPANDIDO = 1280;

/**
 * Estado do menu lateral, compartilhado entre cabeçalho, sidebar e layout.
 *
 * - Desktop: `menuExpandido` alterna entre menu completo e trilho de ícones;
 *   o conteúdo ocupa o espaço liberado.
 * - Celular: `gavetaAberta` controla a gaveta sobreposta (com overlay).
 */
@Service()
export class LayoutService {
  private readonly documento = inject(DOCUMENT);
  private readonly preferencias = inject(PreferenciasService);
  private readonly noNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  readonly modoGaveta = signal(false);
  readonly menuExpandido = signal(true);
  readonly gavetaAberta = signal(false);

  /** Valor de `aria-expanded` do botão hambúrguer. */
  readonly menuVisivel = computed(() =>
    this.modoGaveta() ? this.gavetaAberta() : this.menuExpandido(),
  );

  readonly rotuloBotaoMenu = computed(() => {
    if (this.modoGaveta()) {
      return this.gavetaAberta() ? 'Fechar menu' : 'Abrir menu';
    }
    return this.menuExpandido() ? 'Recolher menu' : 'Expandir menu';
  });

  constructor() {
    const amplo = this.consultar(`(min-width: ${LARGURA_MENU_EXPANDIDO}px)`);
    this.menuExpandido.set(!this.preferencias.menuRecolhido() && (amplo?.matches ?? true));

    const gaveta = this.consultar(`(max-width: ${LARGURA_MODO_GAVETA - 0.02}px)`);
    if (gaveta) {
      this.modoGaveta.set(gaveta.matches);
      const aoMudar = (evento: MediaQueryListEvent) => {
        this.modoGaveta.set(evento.matches);
        this.gavetaAberta.set(false);
      };
      gaveta.addEventListener('change', aoMudar);
      inject(DestroyRef).onDestroy(() => gaveta.removeEventListener('change', aoMudar));
    }

    effect(() => {
      const bloquear = this.modoGaveta() && this.gavetaAberta();
      this.documento.body?.classList.toggle('ag-scroll-bloqueado', bloquear);
    });
  }

  alternarMenu(): void {
    if (this.modoGaveta()) {
      this.gavetaAberta.update((aberta) => !aberta);
    } else {
      this.menuExpandido.update((expandido) => !expandido);
    }
  }

  fecharGaveta(): void {
    this.gavetaAberta.set(false);
  }

  private consultar(consulta: string): MediaQueryList | null {
    if (!this.noNavegador || typeof window.matchMedia !== 'function') {
      return null;
    }
    return window.matchMedia(consulta);
  }
}
