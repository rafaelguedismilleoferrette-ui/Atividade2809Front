import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Marca } from '../models/marca.model';

@Service()
export class MarcaService {
  private readonly http = inject(HttpClient);

  listarMarcas(nome = ''): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${environment.apiUrl}/marcas/listar-marcas`, {
      params: { nome: nome.trim() },
    });
  }
}
