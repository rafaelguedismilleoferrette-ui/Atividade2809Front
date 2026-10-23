import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cidade } from '../models/cidade.model';

/** Comunicação com o `CidadeController` do backend. */
@Service()
export class CidadeService {
  private readonly chamadaHttp = inject(HttpClient);

  readonly urlCidade = `${environment.apiUrl}/cidades`;

  /**
   * Busca por trecho do nome, sem diferenciar maiúsculas. O backend devolve
   * no máximo 10 cidades e diferencia acentos ("sao" não encontra "São").
   */
  buscarCidadesPorNome(nome: string): Observable<Cidade[]> {
    // Barras quebrariam o path variable do Spring; não existem em nomes de cidade.
    const termo = encodeURIComponent(nome.replace(/[\\/]/g, ' ').trim());
    return this.chamadaHttp.get<Cidade[]>(`${this.urlCidade}/buscar-cidade-por-nome/${termo}`);
  }

  /** Busca pelo código IBGE de 7 dígitos (ex.: 4104808 = Cascavel/PR). */
  buscarCidadePorCodigoIbge(codigoIbge: number): Observable<Cidade> {
    return this.chamadaHttp.get<Cidade>(`${this.urlCidade}/buscar-codigo-ibge/${codigoIbge}`);
  }
}
