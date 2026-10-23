import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckCircle } from '@primeicons/angular/check-circle';
import { ExclamationTriangle } from '@primeicons/angular/exclamation-triangle';
import { Server } from '@primeicons/angular/server';
import { SlidersH } from '@primeicons/angular/sliders-h';
import { Spinner } from '@primeicons/angular/spinner';
import { Undo } from '@primeicons/angular/undo';
import { Wifi } from '@primeicons/angular/wifi';
import { ButtonDirective } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { environment } from '../../../environments/environment';
import { mensagemErroHttp } from '../../core/http/erro-api';
import { ClienteService } from '../../core/services/cliente-service';
import { NotificacaoService } from '../../core/services/notificacao-service';
import {
  OPCOES_ITENS_POR_PAGINA,
  PreferenciasService,
} from '../../core/services/preferencias-service';
import { LayoutService } from '../../layout/layout-service';
import { CabecalhoPagina } from '../../shared/components/cabecalho-pagina/cabecalho-pagina';

type ResultadoConexao =
  { estado: 'ok'; clientes: number; tempoMs: number } | { estado: 'erro'; mensagem: string };

@Component({
  selector: 'app-configuracoes',
  imports: [
    FormsModule,
    ButtonDirective,
    SelectModule,
    ToggleSwitch,
    CabecalhoPagina,
    CheckCircle,
    ExclamationTriangle,
    Server,
    SlidersH,
    Spinner,
    Undo,
    Wifi,
  ],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.css',
})
export class Configuracoes {
  protected readonly preferencias = inject(PreferenciasService);
  private readonly layout = inject(LayoutService);
  private readonly clienteService = inject(ClienteService);
  private readonly notificacao = inject(NotificacaoService);

  protected readonly opcoesItens = OPCOES_ITENS_POR_PAGINA.map((valor) => ({
    rotulo: `${valor} por página`,
    valor,
  }));
  protected readonly apiUrl = environment.apiUrl;
  protected readonly usaProxy = environment.apiUrl.startsWith('/');

  protected readonly testando = signal(false);
  protected readonly resultado = signal<ResultadoConexao | null>(null);

  protected alterarMenuRecolhido(recolhido: boolean): void {
    this.preferencias.menuRecolhido.set(recolhido);
    if (!this.layout.modoGaveta()) {
      this.layout.menuExpandido.set(!recolhido);
    }
  }

  protected restaurarPadrao(): void {
    this.preferencias.restaurarPadrao();
    if (!this.layout.modoGaveta()) {
      this.layout.menuExpandido.set(true);
    }
    this.notificacao.sucesso('Preferências restauradas para o padrão.');
  }

  protected testarConexao(): void {
    if (this.testando()) {
      return;
    }
    this.testando.set(true);
    this.resultado.set(null);
    const inicio = performance.now();
    this.clienteService.listarClientes().subscribe({
      next: (clientes) => {
        this.resultado.set({
          estado: 'ok',
          clientes: clientes.length,
          tempoMs: Math.round(performance.now() - inicio),
        });
        this.testando.set(false);
      },
      error: (erro: unknown) => {
        this.resultado.set({ estado: 'erro', mensagem: mensagemErroHttp(erro) });
        this.testando.set(false);
      },
    });
  }
}
