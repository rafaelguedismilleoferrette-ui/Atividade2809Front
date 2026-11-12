import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowLeft } from '@primeicons/angular/arrow-left';
import { Pencil } from '@primeicons/angular/pencil';
import { ButtonDirective } from 'primeng/button';
import { catchError, of, switchMap } from 'rxjs';
import { mensagemErroHttp } from '../../../core/http/erro-api';
import { rotuloCidade } from '../../../core/models/cidade.model';
import { Cliente } from '../../../core/models/cliente.model';
import { ClienteService } from '../../../core/services/cliente-service';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { EstadoPainel } from '../../../shared/components/estado-painel/estado-painel';
import { CepPipe, DocumentoPipe, TelefonePipe } from '../../../shared/pipes/formatacao.pipes';

@Component({
  selector: 'app-cliente-detalhes',
  imports: [
    RouterLink,
    ButtonDirective,
    ArrowLeft,
    Pencil,
    CabecalhoPagina,
    EstadoPainel,
    CepPipe,
    DocumentoPipe,
    TelefonePipe,
  ],
  templateUrl: './cliente-detalhes.html',
  styleUrl: './cliente-detalhes.css',
})
export class ClienteDetalhes implements OnInit {
  private readonly rota = inject(ActivatedRoute);
  private readonly service = inject(ClienteService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly cliente = signal<Cliente | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly rotuloCidade = rotuloCidade;

  ngOnInit(): void {
    this.rota.paramMap
      .pipe(
        switchMap((parametros) => {
          this.cliente.set(null);
          this.erro.set(null);
          this.carregando.set(true);
          const id = Number(parametros.get('id'));
          if (!Number.isSafeInteger(id) || id <= 0) {
            this.erro.set('O identificador do cliente não é válido.');
            return of(null);
          }
          return this.service.buscarClientePorId(id).pipe(
            catchError((erro: unknown) => {
              this.erro.set(
                mensagemErroHttp(erro, 'Verifique se o cliente ainda existe na lista.'),
              );
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((cliente) => {
        this.cliente.set(cliente);
        this.carregando.set(false);
      });
  }
}
