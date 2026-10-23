import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ConfirmationService, MessageService } from 'primeng/api';

import { App } from './app';
import { routes } from './app.routes';
import { TituloPaginaStrategy } from './core/titulo-pagina.strategy';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: TitleStrategy, useExisting: TituloPaginaStrategy },
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        ConfirmationService,
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('a raiz só contém o roteador (o formulário não é mais renderizado direto)', () => {
    const fixture = TestBed.createComponent(App);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('router-outlet')).not.toBeNull();
    expect(el.querySelector('app-cliente-cadastrar')).toBeNull();
  });
});

describe('Navegação', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: TitleStrategy, useExisting: TituloPaginaStrategy },
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        ConfirmationService,
      ],
    });
  });

  it('redireciona "/" para o dashboard dentro do layout principal', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(TestBed.inject(Router).url).toBe('/dashboard');
    expect(harness.routeNativeElement?.querySelector('app-header')).not.toBeNull();
    expect(harness.routeNativeElement?.textContent).toContain('Dashboard');
    expect(TestBed.inject(Title).getTitle()).toBe('Dashboard · Auto Gestão');
  });

  // Carrega três telas sob demanda (lazy loading), por isso o tempo maior.
  it('abre a listagem, o cadastro e a edição de clientes', { timeout: 30_000 }, async () => {
    const http = TestBed.inject(HttpTestingController);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/clientes');
    expect(harness.routeNativeElement?.querySelector('app-cliente-listar')).not.toBeNull();
    http.expectOne((r) => r.url.endsWith('/clientes/listar-clientes')).flush([]);

    await harness.navigateByUrl('/clientes/novo');
    expect(harness.routeNativeElement?.querySelector('app-cliente-cadastrar')).not.toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Novo cliente · Auto Gestão');

    await harness.navigateByUrl('/clientes/5/editar');
    expect(TestBed.inject(Title).getTitle()).toBe('Editar cliente · Auto Gestão');
    http.expectOne((r) => r.url.endsWith('/clientes/buscar-cliente/5'));
  });

  it('mostra a página 404 para rotas desconhecidas', async () => {
    const harness = await RouterTestingHarness.create('/veiculos');
    expect(harness.routeNativeElement?.textContent).toContain('Página não encontrada');
  });
});
