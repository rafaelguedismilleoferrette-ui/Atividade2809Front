import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { MarcaListar } from './marca-listar';

const url = `${environment.apiUrl}/marcas/listar-marcas`;

describe('Consulta de marcas', () => {
  let fixture: ComponentFixture<MarcaListar>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcaListar],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MarcaListar);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  function requisicao(nome = '') {
    const req = http.expectOne((r) => r.url === url && r.params.get('nome') === nome);
    expect(req.request.method).toBe('GET');
    return req;
  }

  async function buscar(nome: string) {
    const input = el.querySelector<HTMLInputElement>('#busca-marca')!;
    input.value = nome;
    input.dispatchEvent(new Event('input'));
    el.querySelector('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
  }

  it('consulta a API ao abrir, exibe marcas e informa o limite de resultados', async () => {
    expect(el.textContent).toContain('Carregando marcas');
    requisicao().flush([
      { id: 1, nome: 'Fiat' },
      { id: 2, nome: 'Ford' },
    ]);
    await fixture.whenStable();
    expect(el.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(el.textContent).toContain('Fiat');
    expect(el.textContent).toContain('até 10');
  });

  it('envia o filtro como parâmetro, preservando acentos e caracteres especiais', async () => {
    requisicao().flush([]);
    await buscar('  São & Cia  ');
    const req = requisicao('São & Cia');
    expect(req.request.urlWithParams).toContain('S%C3%A3o%20%26%20Cia');
    req.flush([]);
    await fixture.whenStable();
    expect(el.textContent).toContain('Tente buscar por outro nome');
  });

  it('limpa o filtro e consulta novamente sem nome', async () => {
    requisicao().flush([]);
    await buscar('Fiat');
    requisicao('Fiat').flush([]);
    await fixture.whenStable();
    const limpar = [...el.querySelectorAll<HTMLButtonElement>('button')].find(
      (b) => b.textContent?.trim() === 'Limpar',
    )!;
    limpar.click();
    await fixture.whenStable();
    requisicao().flush([]);
    await fixture.whenStable();
    expect(el.querySelector<HTMLInputElement>('#busca-marca')!.value).toBe('');
    expect(el.textContent).toContain('Ainda não há marcas cadastradas');
  });

  it('permite repetir o filtro enviado após falha, mesmo com o campo alterado', async () => {
    requisicao().flush([]);
    await buscar('Fiat');
    requisicao('Fiat').flush('Indisponível', { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();
    expect(el.textContent).toContain('Não foi possível carregar as marcas');
    fixture.componentInstance.formulario.controls.nome.setValue('Ford');
    [...el.querySelectorAll<HTMLButtonElement>('button')]
      .find((b) => b.textContent?.includes('Tentar novamente'))!
      .click();
    await fixture.whenStable();
    requisicao('Fiat').flush([{ id: 1, nome: 'Fiat' }]);
    await fixture.whenStable();
    expect(el.querySelector('tbody')!.textContent).toContain('Fiat');
  });

  it('bloqueia filtro inválido e envio duplicado durante uma consulta', async () => {
    fixture.componentInstance.buscar();
    requisicao().flush([]);
    await buscar('a'.repeat(101));
    expect(el.textContent).toContain('Use no máximo 100 caracteres');
    http.expectNone((r) => r.url === url);
  });
});
