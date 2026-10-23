import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Search } from '@primeicons/angular/search';
import { Spinner } from '@primeicons/angular/spinner';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { mensagemErroHttp } from '../../core/http/erro-api';
import { Marca } from '../../core/models/marca.model';
import { MarcaService } from '../../core/services/marca-service';
import { CabecalhoPagina } from '../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { EstadoPainel } from '../../shared/components/estado-painel/estado-painel';

@Component({
  selector: 'app-marca-listar',
  imports: [
    ReactiveFormsModule,
    ButtonDirective,
    InputTextModule,
    Search,
    Spinner,
    CabecalhoPagina,
    EstadoPainel,
  ],
  templateUrl: './marca-listar.html',
  styleUrl: './marca-listar.css',
})
export class MarcaListar implements OnInit {
  readonly formulario = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(100)] }),
  });
  protected readonly marcas = signal<Marca[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly nomeConsultado = signal('');
  private readonly service = inject(MarcaService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.carregar('');
  }

  buscar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid || this.carregando()) return;
    this.carregar(this.formulario.controls.nome.value.trim());
  }

  limpar(): void {
    if (this.carregando()) return;
    this.formulario.reset();
    this.carregar('');
  }

  tentarNovamente(): void {
    if (!this.carregando()) this.carregar(this.nomeConsultado());
  }

  private carregar(nome: string): void {
    this.nomeConsultado.set(nome);
    this.carregando.set(true);
    this.erro.set(null);
    this.marcas.set([]);
    this.service
      .listarMarcas(nome)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (marcas) => {
          this.marcas.set(marcas);
          this.carregando.set(false);
        },
        error: (erro: unknown) => {
          this.erro.set(mensagemErroHttp(erro));
          this.carregando.set(false);
        },
      });
  }
}
