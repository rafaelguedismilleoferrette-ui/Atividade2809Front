import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngleRight } from '@primeicons/angular/angle-right';
import { Car } from '@primeicons/angular/car';
import { Cog } from '@primeicons/angular/cog';
import { ObjectsColumn } from '@primeicons/angular/objects-column';
import { Times } from '@primeicons/angular/times';
import { Users } from '@primeicons/angular/users';
import { FocusTrap } from 'primeng/focustrap';
import { Tooltip } from 'primeng/tooltip';
import { NOME_SISTEMA } from '../../core/titulo-pagina.strategy';
import { LayoutService } from '../layout-service';
import { NAVEGACAO } from '../navegacao';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    FocusTrap,
    Tooltip,
    AngleRight,
    Car,
    Cog,
    ObjectsColumn,
    Times,
    Users,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  protected readonly layout = inject(LayoutService);
  protected readonly grupos = NAVEGACAO;
  protected readonly nomeSistema = NOME_SISTEMA;

  /** Pedido de fechamento da gaveta (botão "X"); o layout devolve o foco. */
  readonly fechar = output<void>();

  /** Trilho de ícones: desktop com o menu recolhido. */
  protected readonly recolhido = computed(
    () => !this.layout.modoGaveta() && !this.layout.menuExpandido(),
  );

  /** Gaveta fechada no celular: fora da ordem de tabulação e do leitor de tela. */
  protected readonly inerte = computed(
    () => this.layout.modoGaveta() && !this.layout.gavetaAberta(),
  );

  private readonly botaoFechar = viewChild<ElementRef<HTMLButtonElement>>('botaoFechar');

  constructor() {
    // Ao abrir a gaveta, leva o foco para dentro dela.
    afterRenderEffect(() => {
      if (this.layout.modoGaveta() && this.layout.gavetaAberta()) {
        this.botaoFechar()?.nativeElement.focus();
      }
    });
  }
}
