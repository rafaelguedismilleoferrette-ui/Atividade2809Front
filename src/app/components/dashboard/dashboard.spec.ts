import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { CLIENTES_TESTE } from '../../testing/dados-teste';
import { Dashboard } from './dashboard';

const url = `${environment.apiUrl}/clientes/listar-clientes`;

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Dashboard);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  const valorDoIndicador = (rotulo: string) =>
    [...el.querySelectorAll('.kpi')]
      .find((k) => k.querySelector('.kpi__rotulo')?.textContent?.includes(rotulo))
      ?.querySelector('.kpi__valor')
      ?.textContent?.trim();

  it('mostra totais de clientes, pessoas físicas e jurídicas vindos da API', async () => {
    expect(el.querySelector('[aria-label="Carregando indicadores"]')).not.toBeNull();
    http.expectOne(url).flush(CLIENTES_TESTE);
    await fixture.whenStable();

    expect(valorDoIndicador('Total de clientes')).toBe('4');
    expect(valorDoIndicador('Pessoas físicas')).toBe('2');
    expect(valorDoIndicador('Pessoas jurídicas')).toBe('1');
    expect(el.textContent).toContain('Cascavel - PR');
    expect(el.textContent).toContain('1 cadastro sem cidade');
  });

  it('mostra estado vazio sem inventar números', async () => {
    http.expectOne(url).flush([]);
    await fixture.whenStable();
    expect(el.textContent).toContain('Ainda não há clientes');
    expect(el.querySelector('.kpi')).toBeNull();
  });

  it('mostra erro de consulta e permite tentar novamente', async () => {
    http.expectOne(url).flush(null, { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();
    expect(el.textContent).toContain('Não foi possível carregar os indicadores');

    [...el.querySelectorAll('button')]
      .find((b) => b.textContent?.includes('Tentar novamente'))!
      .click();
    http.expectOne(url).flush(CLIENTES_TESTE);
    await fixture.whenStable();
    expect(valorDoIndicador('Total de clientes')).toBe('4');
  });
});
