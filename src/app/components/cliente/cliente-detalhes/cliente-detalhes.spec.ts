import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../../../../environments/environment';
import { criarCliente } from '../../../testing/dados-teste';
import { ClienteDetalhes } from './cliente-detalhes';

describe('ClienteDetalhes', () => {
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/clientes/buscar-cliente`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'clientes/:id', component: ClienteDetalhes }]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('mostra a ficha e carrega outro cliente quando o ID da rota muda', async () => {
    const harness = await RouterTestingHarness.create('/clientes/1');
    http.expectOne(`${base}/1`).flush(criarCliente());
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.textContent).toContain('Ana Souza');
    expect(harness.routeNativeElement?.textContent).toContain('529.982.247-25');
    expect(
      harness.routeNativeElement?.querySelector('a[href="/clientes/1/editar"]'),
    ).not.toBeNull();
    await harness.navigateByUrl('/clientes/2');
    http
      .expectOne(`${base}/2`)
      .flush(criarCliente({ id: 2, nome: 'José', telefone: null, cidade: null }));
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.textContent).toContain('José');
    expect(harness.routeNativeElement?.textContent).not.toContain('Ana Souza');
    expect(harness.routeNativeElement?.textContent).toContain('Não informada');
  });

  it('mostra erro de cliente inexistente sem oferecer edição', async () => {
    const harness = await RouterTestingHarness.create('/clientes/99');
    http.expectOne(`${base}/99`).flush(null, { status: 500, statusText: 'Internal Server Error' });
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.textContent).toContain('Não foi possível abrir a ficha');
    expect(harness.routeNativeElement?.querySelector('a[href$="/editar"]')).toBeNull();
  });

  it('não consulta a API quando o identificador é inválido', async () => {
    const harness = await RouterTestingHarness.create('/clientes/abc');
    http.expectNone((req) => req.url.startsWith(base));
    expect(harness.routeNativeElement?.textContent).toContain(
      'identificador do cliente não é válido',
    );
  });
});
