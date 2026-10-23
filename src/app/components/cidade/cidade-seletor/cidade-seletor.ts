import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, forwardRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MapMarker } from '@primeicons/angular/map-marker';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { catchError, map, Observable, of, Subject, switchMap } from 'rxjs';
import { mensagemErroHttp } from '../../../core/http/erro-api';
import { Cidade, rotuloCidade } from '../../../core/models/cidade.model';
import { CidadeService } from '../../../core/services/cidade-service';

/** O backend devolve no máximo 10 cidades por busca de nome. */
export const LIMITE_RESULTADOS_CIDADE = 10;

interface ResultadoBusca {
  cidades: Cidade[];
  erro: string | null;
}

/**
 * Campo de cidade com busca na API (`/cidades/buscar-cidade-por-nome` e,
 * para 7 dígitos, `/cidades/buscar-codigo-ibge`).
 *
 * Funciona como um FormControl comum: o valor é o objeto `Cidade` escolhido
 * (com `id`), que é o que o relacionamento `@ManyToOne` do backend espera.
 */
@Component({
  selector: 'app-cidade-seletor',
  imports: [FormsModule, AutoComplete, MapMarker],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CidadeSeletor), multi: true },
  ],
  templateUrl: './cidade-seletor.html',
  styleUrl: './cidade-seletor.css',
})
export class CidadeSeletor implements ControlValueAccessor {
  private readonly cidadeService = inject(CidadeService);

  readonly inputId = input('cidade');
  readonly invalido = input(false);

  protected readonly valor = signal<Cidade | string | null>(null);
  protected readonly sugestoes = signal<Cidade[]>([]);
  protected readonly desabilitado = signal(false);
  protected readonly erroBusca = signal<string | null>(null);

  protected readonly mensagemVazia = computed(
    () => this.erroBusca() ?? 'Nenhuma cidade encontrada. Confira a grafia e os acentos.',
  );
  protected readonly limiteAtingido = computed(
    () => this.sugestoes().length >= LIMITE_RESULTADOS_CIDADE,
  );
  protected readonly rotulo = (cidade: Cidade): string => rotuloCidade(cidade);

  private readonly termos = new Subject<string>();
  private aoAlterar: (valor: Cidade | string | null) => void = () => {};
  protected aoTocar: () => void = () => {};

  constructor() {
    // switchMap descarta respostas de buscas antigas enquanto o usuário digita.
    this.termos
      .pipe(
        switchMap((termo) => this.buscar(termo)),
        takeUntilDestroyed(),
      )
      .subscribe(({ cidades, erro }) => {
        this.erroBusca.set(erro);
        this.sugestoes.set([...cidades]);
      });
  }

  protected pesquisar(evento: AutoCompleteCompleteEvent): void {
    this.termos.next(evento.query.trim());
  }

  protected selecionar(valor: Cidade | string | null): void {
    this.valor.set(valor);
    this.aoAlterar(valor);
  }

  writeValue(valor: Cidade | string | null): void {
    this.valor.set(valor ?? null);
  }

  registerOnChange(fn: (valor: Cidade | string | null) => void): void {
    this.aoAlterar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado.set(desabilitado);
  }

  private buscar(termo: string): Observable<ResultadoBusca> {
    if (/^\d{7}$/.test(termo)) {
      return this.cidadeService.buscarCidadePorCodigoIbge(Number(termo)).pipe(
        map((cidade) => ({ cidades: cidade ? [cidade] : [], erro: null })),
        // Código inexistente vira HTTP 500 no backend: tratamos como "não encontrado".
        catchError((erro: unknown) =>
          of({
            cidades: [],
            erro:
              erro instanceof HttpErrorResponse && erro.status >= 500
                ? `Nenhuma cidade com o código IBGE ${termo}.`
                : mensagemErroHttp(erro),
          }),
        ),
      );
    }

    return this.cidadeService.buscarCidadesPorNome(termo).pipe(
      map((cidades) => ({ cidades: cidades ?? [], erro: null })),
      catchError((erro: unknown) => of({ cidades: [], erro: mensagemErroHttp(erro) })),
    );
  }
}
