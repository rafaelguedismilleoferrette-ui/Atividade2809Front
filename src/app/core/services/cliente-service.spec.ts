import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Cliente, ClientePayload } from '../models/cliente.model';
import { ClienteService } from './cliente-service';

const base = `${environment.apiUrl}/clientes`;

const payload: ClientePayload = {
  nome: 'Ana Souza',
  tipoPessoa: 'PF',
  cpfCnpj: '52998224725',
  telefone: '45999990000',
  email: 'ana@empresa.com.br',
  logradouro: 'Rua Paraná',
  numero: '100',
  bairro: 'Centro',
  cep: '85810000',
  cidade: { id: 2853 },
};

describe('ClienteService', () => {
  let service: ClienteService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClienteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('lista clientes com GET /clientes/listar-clientes', () => {
    const resposta = [{ id: 1, nome: 'Ana' }] as Cliente[];
    let recebido: Cliente[] | undefined;
    service.listarClientes().subscribe((c) => (recebido = c));

    const req = http.expectOne(`${base}/listar-clientes`);
    expect(req.request.method).toBe('GET');
    req.flush(resposta);
    expect(recebido).toEqual(resposta);
  });

  it('busca por id com GET /clientes/buscar-cliente/{id}', () => {
    service.buscarClientePorId(7).subscribe();
    const req = http.expectOne(`${base}/buscar-cliente/7`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 7, nome: 'Ana' });
  });

  it('salva com POST /clientes/salvar-cliente enviando cidade como { id }', () => {
    service.salvarCliente(payload).subscribe();
    const req = http.expectOne(`${base}/salvar-cliente`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.body.cidade).toEqual({ id: 2853 });
    req.flush({ id: 1, ...payload });
  });

  it('atualiza com PUT /clientes/atualizar-cliente/{id}', () => {
    service.atualizarCliente(3, payload).subscribe();
    const req = http.expectOne(`${base}/atualizar-cliente/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 3, ...payload });
  });

  it('exclui com DELETE /clientes/deletar-cliente/{id}', () => {
    let concluiu = false;
    service.deletarCliente(9).subscribe(() => (concluiu = true));
    const req = http.expectOne(`${base}/deletar-cliente/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(concluiu).toBe(true);
  });

  it('propaga o erro HTTP para quem chamou', () => {
    let status = 0;
    service.listarClientes().subscribe({ error: (e) => (status = e.status) });
    http
      .expectOne(`${base}/listar-clientes`)
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    expect(status).toBe(500);
  });
});
