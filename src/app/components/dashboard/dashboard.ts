import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight } from '@primeicons/angular/arrow-right';
import { Building } from '@primeicons/angular/building';
import { ChartBar } from '@primeicons/angular/chart-bar';
import { Clock } from '@primeicons/angular/clock';
import { MapMarker } from '@primeicons/angular/map-marker';
import { Plus } from '@primeicons/angular/plus';
import { Refresh } from '@primeicons/angular/refresh';
import { User } from '@primeicons/angular/user';
import { UserPlus } from '@primeicons/angular/user-plus';
import { Users } from '@primeicons/angular/users';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { mensagemErroHttp } from '../../core/http/erro-api';
import { rotuloCidade } from '../../core/models/cidade.model';
import { Cliente } from '../../core/models/cliente.model';
import { ClienteService } from '../../core/services/cliente-service';
import { CabecalhoPagina } from '../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { EstadoPainel } from '../../shared/components/estado-painel/estado-painel';
import { GraficoBarras } from './grafico-barras';
import { GraficoComposicao, SegmentoComposicao } from './grafico-composicao';
import { calcularResumo, percentual } from './resumo-clientes';

@Component({
  selector: 'app-dashboard',
  imports: [
    DecimalPipe,
    RouterLink,
    ButtonDirective,
    Skeleton,
    CabecalhoPagina,
    GraficoBarras,
    GraficoComposicao,
    EstadoPainel,
    ArrowRight,
    Building,
    ChartBar,
    Clock,
    MapMarker,
    Plus,
    Refresh,
    User,
    UserPlus,
    Users,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly clienteService = inject(ClienteService);

  protected readonly clientes = signal<Cliente[] | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly resumo = computed(() => {
    const clientes = this.clientes();
    return clientes ? calcularResumo(clientes) : null;
  });

  /** Segmentos da barra de composição (só entram os que têm clientes). */
  protected readonly composicao = computed<SegmentoComposicao[]>(() => {
    const r = this.resumo();
    if (!r || r.total === 0) {
      return [];
    }
    const segmentos: SegmentoComposicao[] = [
      {
        chave: 'pf',
        rotulo: 'Pessoa física',
        total: r.pessoasFisicas,
        percentual: percentual(r.pessoasFisicas, r.total),
      },
      {
        chave: 'pj',
        rotulo: 'Pessoa jurídica',
        total: r.pessoasJuridicas,
        percentual: percentual(r.pessoasJuridicas, r.total),
      },
      {
        chave: 'sem-tipo',
        rotulo: 'Sem tipo informado',
        total: r.semTipo,
        percentual: percentual(r.semTipo, r.total),
      },
    ];
    return segmentos.filter((s) => s.total > 0);
  });

  protected readonly rotuloCidade = rotuloCidade;
  protected readonly percentual = percentual;

  ngOnInit(): void {
    this.carregarIndicadores();
  }

  carregarIndicadores(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.clienteService.listarClientes().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.carregando.set(false);
      },
      error: (erro: unknown) => {
        this.erro.set(mensagemErroHttp(erro));
        this.carregando.set(false);
      },
    });
  }
}
