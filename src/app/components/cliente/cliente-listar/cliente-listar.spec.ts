import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';

import { environment } from '../../../../environments/environment';
import { CLIENTES_TESTE } from '../../../testing/dados-teste';
import { ClienteListar } from './cliente-listar';

const base = `${environment.apiUrl}/clientes`;

describe('ClienteListar', () => {
  let component: ClienteListar;
  let fixture: ComponentFixture<ClienteListar>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteListar],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        MessageService,
        ConfirmationService,
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ClienteListar);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  async function responderLista(clientes = CLIENTES_TESTE) {
    http.expectOne(`${base}/listar-clientes`).flush(clientes);
    await fixture.whenStable();
  }

  const linhas = () => el.querySelectorAll('tbody tr');

  it('should create', async () => {
    expect(component).toBeTruthy();
    await responderLista();
  });

  it('carrega e exibe os clientes com CPF/CNPJ e telefone formatados', async () => {
    expect(el.querySelector('[aria-label="Carregando clientes"]')).not.toBeNull();
    await responderLista();

    expect(linhas()).toHaveLength(4);
    expect(el.textContent).toContain('529.982.247-25');
    expect(el.textContent).toContain('11.222.333/0001-81');
    expect(el.textContent).toContain('(45) 99999-0000');
    expect(el.textContent).toContain('Cascavel - PR');
    expect(el.textContent).toContain('Não informada');
  });

  it('filtra por nome e por tipo de pessoa', async () => {
    await responderLista();

    const busca = el.querySelector<HTMLInputElement>('#busca-cliente')!;
    busca.value = 'jose';
    busca.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(linhas()).toHaveLength(1);
    expect(el.textContent).toContain('José Pereira');
    expect(el.textContent).toContain('1 de 4 clientes');
  });

  it('mostra estado vazio quando não há clientes', async () => {
    await responderLista([]);
    expect(el.textContent).toContain('Nenhum cliente cadastrado');
  });

  it('mostra o erro da API e permite tentar novamente', async () => {
    http
      .expectOne(`${base}/listar-clientes`)
      .flush(null, { status: 0, statusText: 'Unknown Error' });
    await fixture.whenStable();
    expect(el.textContent).toContain('Não foi possível carregar os clientes');

    const tentar = [...el.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Tentar novamente'),
    )!;
    tentar.click();
    await responderLista();
    expect(linhas()).toHaveLength(4);
  });

  it('só exclui depois da confirmação e recarrega a lista', async () => {
    await responderLista();
    const confirmacao = TestBed.inject(ConfirmationService);
    let pedido: Confirmation | undefined;
    vi.spyOn(confirmacao, 'confirm').mockImplementation((c) => {
      pedido = c;
      return confirmacao;
    });

    el.querySelector<HTMLButtonElement>('button[aria-label="Excluir José Pereira"]')!.click();
    expect(pedido?.message).toContain('José Pereira');
    expect(pedido?.message).toContain('111.444.777-35');
    http.expectNone(`${base}/deletar-cliente/2`);

    pedido!.accept!();
    const req = http.expectOne(`${base}/deletar-cliente/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    await responderLista(CLIENTES_TESTE.filter((c) => c.id !== 2));
    expect(linhas()).toHaveLength(3);
  });

  it('informa falha na exclusão sem remover o cliente da lista', async () => {
    await responderLista();
    const confirmacao = TestBed.inject(ConfirmationService);
    const erro = vi.spyOn(TestBed.inject(MessageService), 'add');
    vi.spyOn(confirmacao, 'confirm').mockImplementation((c) => {
      c.accept?.();
      return confirmacao;
    });

    el.querySelector<HTMLButtonElement>('button[aria-label="Excluir Ana Souza"]')!.click();
    http
      .expectOne(`${base}/deletar-cliente/1`)
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();

    expect(erro).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    expect(linhas()).toHaveLength(4);
  });
});
