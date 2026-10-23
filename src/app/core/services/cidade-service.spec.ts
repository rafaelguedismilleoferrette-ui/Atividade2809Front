import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { CidadeService } from './cidade-service';

const base = `${environment.apiUrl}/cidades`;

describe('CidadeService', () => {
  let service: CidadeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CidadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('busca por nome codificando acentos e espaços na URL', () => {
    service.buscarCidadesPorNome('  São Paulo ').subscribe();
    const req = http.expectOne(`${base}/buscar-cidade-por-nome/S%C3%A3o%20Paulo`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('remove barras que quebrariam o path variable', () => {
    service.buscarCidadesPorNome('Cas/cavel').subscribe();
    http.expectOne(`${base}/buscar-cidade-por-nome/Cas%20cavel`).flush([]);
  });

  it('busca pelo código IBGE', () => {
    service.buscarCidadePorCodigoIbge(4104808).subscribe();
    const req = http.expectOne(`${base}/buscar-codigo-ibge/4104808`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 2853, nome: 'Cascavel', ibge: 4104808, estado: null });
  });
});
