import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { filter } from 'rxjs';
import { Header } from '../header/header';
import { LayoutService } from '../layout-service';
import { Sidebar } from '../sidebar/sidebar';

/**
 * Estrutura administrativa única: cabeçalho, menu lateral e área de conteúdo.
 * Também hospeda os toasts e o diálogo de confirmação usados pelas telas.
 */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar, Toast, ConfirmDialog],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  host: {
    '(document:keydown.escape)': 'aoPressionarEscape()',
  },
})
export class MainLayout {
  protected readonly layout = inject(LayoutService);
  private readonly documento = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  constructor() {
    // Selecionar uma rota fecha a gaveta e leva o foco ao título da página nova
    // (depois que ela renderiza, pois as telas são carregadas sob demanda).
    inject(Router)
      .events.pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => {
        if (this.layout.modoGaveta() && this.layout.gavetaAberta()) {
          this.layout.fecharGaveta();
          afterNextRender(() => this.focarConteudo(), { injector: this.injector });
        }
      });
  }

  protected aoPressionarEscape(): void {
    if (this.layout.modoGaveta() && this.layout.gavetaAberta()) {
      this.fecharGavetaDevolvendoFoco();
    }
  }

  protected fecharGavetaDevolvendoFoco(): void {
    this.layout.fecharGaveta();
    this.documento.getElementById('botao-menu')?.focus();
  }

  protected pularParaConteudo(evento: Event): void {
    evento.preventDefault();
    this.focarConteudo();
  }

  private focarConteudo(): void {
    const conteudo = this.documento.getElementById('conteudo-principal');
    const titulo = conteudo?.querySelector<HTMLElement>('h1[tabindex]');
    (titulo ?? conteudo)?.focus({ preventScroll: false });
  }
}
