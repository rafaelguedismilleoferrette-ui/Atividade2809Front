import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FilterSlash } from '@primeicons/angular/filter-slash';
import { MapMarker } from '@primeicons/angular/map-marker';
import { Pencil } from '@primeicons/angular/pencil';
import { Plus } from '@primeicons/angular/plus';
import { Refresh } from '@primeicons/angular/refresh';
import { Search } from '@primeicons/angular/search';
import { Spinner } from '@primeicons/angular/spinner';
import { Trash } from '@primeicons/angular/trash';
import { UserPlus } from '@primeicons/angular/user-plus';
import { ConfirmationService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { mensagemErroHttp } from '../../../core/http/erro-api';
import { rotuloCidade } from '../../../core/models/cidade.model';
import { Cliente, TIPOS_PESSOA, TipoPessoa } from '../../../core/models/cliente.model';
import { ClienteService } from '../../../core/services/cliente-service';
import { NotificacaoService } from '../../../core/services/notificacao-service';
import {
  OPCOES_ITENS_POR_PAGINA,
  PreferenciasService,
} from '../../../core/services/preferencias-service';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { EstadoPainel } from '../../../shared/components/estado-painel/estado-painel';
import { DocumentoPipe, TelefonePipe } from '../../../shared/pipes/formatacao.pipes';
import { formatarDocumento } from '../../../shared/utils/documentos';
import { filtrarClientes } from './cliente-filtro';

@Component({
  selector: 'app-cliente-listar',
  imports: [
    FormsModule,
    RouterLink,
    TableModule,
    ButtonDirective,
    InputTextModule,
    IconField,
    InputIcon,
    SelectModule,
    Skeleton,
    Tooltip,
    CabecalhoPagina,
    EstadoPainel,
    DocumentoPipe,
    TelefonePipe,
    FilterSlash,
    MapMarker,
    Pencil,
    Plus,
    Refresh,
    Search,
    Spinner,
    Trash,
    UserPlus,
  ],
  templateUrl: './cliente-listar.html',
  styleUrl: './cliente-listar.css',
})
export class ClienteListar implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly confirmacao = inject(ConfirmationService);
  private readonly notificacao = inject(NotificacaoService);
  protected readonly preferencias = inject(PreferenciasService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly excluindoId = signal<number | null>(null);

  protected readonly busca = signal('');
  protected readonly tipo = signal<TipoPessoa | null>(null);
  /** Índice da primeira linha exibida (paginação do p-table). */
  protected readonly primeiro = signal(0);

  protected readonly tipoPessoaOptions = [
    { descricao: 'Todos os tipos', valor: null },
    ...TIPOS_PESSOA,
  ];
  protected readonly opcoesLinhas = [...OPCOES_ITENS_POR_PAGINA];
  protected readonly linhasSkeleton = Array.from({ length: 5 }, (_, i) => i);
  protected readonly rotuloCidade = rotuloCidade;

  protected readonly clientesFiltrados = computed(() =>
    filtrarClientes(this.clientes(), this.busca(), this.tipo()),
  );
  protected readonly filtrosAtivos = computed(
    () => this.busca().trim() !== '' || this.tipo() !== null,
  );

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
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

  protected alterarBusca(valor: string): void {
    this.busca.set(valor);
    this.primeiro.set(0);
  }

  protected alterarTipo(valor: TipoPessoa | null): void {
    this.tipo.set(valor);
    this.primeiro.set(0);
  }

  protected limparFiltros(): void {
    this.busca.set('');
    this.tipo.set(null);
    this.primeiro.set(0);
  }

  protected confirmarExclusao(cliente: Cliente): void {
    const documento = formatarDocumento(cliente.cpfCnpj);
    this.confirmacao.confirm({
      header: 'Excluir cliente',
      message:
        `Deseja excluir <strong>${this.escaparHtml(cliente.nome)}</strong>` +
        (documento ? ` (${this.escaparHtml(documento)})` : '') +
        '?<br>Esta ação não pode ser desfeita.',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      defaultFocus: 'reject',
      accept: () => this.excluirCliente(cliente),
    });
  }

  private excluirCliente(cliente: Cliente): void {
    this.excluindoId.set(cliente.id);
    this.clienteService.deletarCliente(cliente.id).subscribe({
      next: () => {
        this.excluindoId.set(null);
        this.notificacao.sucesso(`${cliente.nome} foi excluído.`, 'Cliente excluído');
        this.carregarClientes();
      },
      error: (erro: unknown) => {
        this.excluindoId.set(null);
        this.notificacao.erro(
          mensagemErroHttp(erro, 'O cliente pode já ter sido excluído; atualize a lista.'),
          'Falha ao excluir',
        );
      },
    });
  }

  private escaparHtml(texto: string): string {
    return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  }
}
