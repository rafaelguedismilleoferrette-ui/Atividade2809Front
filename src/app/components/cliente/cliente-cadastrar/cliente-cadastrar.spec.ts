import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

import { environment } from '../../../../environments/environment';
import { NotificacaoService } from '../../../core/services/notificacao-service';
import { CASCAVEL, criarCliente } from '../../../testing/dados-teste';
import { ClienteCadastrar } from './cliente-cadastrar';

const base = `${environment.apiUrl}/clientes`;

describe('ClienteCadastrar', () => {
  let component: ClienteCadastrar;
  let fixture: ComponentFixture<ClienteCadastrar>;
  let http: HttpTestingController;
  let router: Router;
  let notificacao: NotificacaoService;

  async function criar(id?: string) {
    await TestBed.configureTestingModule({
      imports: [ClienteCadastrar],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        MessageService,
        ConfirmationService,
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    notificacao = TestBed.inject(NotificacaoService);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ClienteCadastrar);
    if (id) {
      fixture.componentRef.setInput('id', id);
    }
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  function preencherValido() {
    const f = component.formularioCliente;
    f.controls.tipoPessoa.setValue('PF');
    f.patchValue({
      nome: 'Ana Souza',
      cpfCnpj: '52998224725',
      telefone: '45999990000',
      email: 'ana@empresa.com.br',
      cep: '85810000',
      logradouro: 'Rua Paraná',
      numero: '100',
      bairro: 'Centro',
      cidade: CASCAVEL,
    });
  }

  afterEach(() => http.verify());

  it('should create', async () => {
    await criar();
    expect(component).toBeTruthy();
  });

  it('tem um controle para cada campo do formulário, inclusive cidade', async () => {
    await criar();
    expect(Object.keys(component.formularioCliente.controls).sort()).toEqual(
      [
        'bairro',
        'cep',
        'cidade',
        'cpfCnpj',
        'email',
        'logradouro',
        'nome',
        'numero',
        'telefone',
        'tipoPessoa',
      ].sort(),
    );
  });

  it('não envia formulário inválido e mostra as mensagens de erro', async () => {
    await criar();
    const aviso = vi.spyOn(notificacao, 'aviso');

    component.salvarCliente();
    await fixture.whenStable();

    http.expectNone(`${base}/salvar-cliente`);
    expect(aviso).toHaveBeenCalled();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('#nome-erro')?.textContent).toContain('Informe o nome');
    expect(el.querySelector('#tipoPessoa-erro')?.textContent).toContain('Selecione o tipo');
    expect(el.querySelector('#cidade-erro')?.textContent).toContain('Selecione a cidade');
  });

  it('libera o documento ao escolher o tipo e valida CPF ou CNPJ conforme o tipo', async () => {
    await criar();
    const { tipoPessoa, cpfCnpj } = component.formularioCliente.controls;
    expect(cpfCnpj.disabled).toBe(true);

    tipoPessoa.setValue('PF');
    cpfCnpj.setValue('12345678900');
    expect(cpfCnpj.enabled).toBe(true);
    expect(cpfCnpj.hasError('cpf')).toBe(true);

    tipoPessoa.setValue('PJ');
    cpfCnpj.setValue('11222333000181');
    expect(cpfCnpj.valid).toBe(true);
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('label[for="cpfCnpj"]')?.textContent,
    ).toContain('CNPJ');
  });

  it('valida o formato do e-mail', async () => {
    await criar();
    const email = component.formularioCliente.controls.email;
    email.setValue('ana@empresa');
    email.markAsTouched();
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#email-erro')?.textContent,
    ).toContain('e-mail válido');
  });

  it('envia POST com o payload normalizado e volta para a lista', async () => {
    await criar();
    const sucesso = vi.spyOn(notificacao, 'sucesso');
    preencherValido();

    component.salvarCliente();
    const req = http.expectOne(`${base}/salvar-cliente`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nome: 'Ana Souza',
      tipoPessoa: 'PF',
      cpfCnpj: '52998224725',
      telefone: '45999990000',
      email: 'ana@empresa.com.br',
      cep: '85810000',
      logradouro: 'Rua Paraná',
      numero: '100',
      bairro: 'Centro',
      cidade: { id: 2853 },
    });
    req.flush(criarCliente({ id: 10 }));

    expect(sucesso).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/clientes']);
  });

  it('impede envios duplicados enquanto a requisição está em andamento', async () => {
    await criar();
    preencherValido();

    component.salvarCliente();
    component.salvarCliente();
    await fixture.whenStable();

    const reqs = http.match(`${base}/salvar-cliente`);
    expect(reqs).toHaveLength(1);
    const botao = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );
    expect(botao?.disabled).toBe(true);
    reqs[0].flush(criarCliente());
  });

  it('mantém os dados digitados quando a API devolve erro', async () => {
    await criar();
    const erro = vi.spyOn(notificacao, 'erro');
    preencherValido();

    component.salvarCliente();
    http
      .expectOne(`${base}/salvar-cliente`)
      .flush(null, { status: 500, statusText: 'Internal Server Error' });

    expect(erro).toHaveBeenCalledWith(expect.stringContaining('CPF/CNPJ'), 'Falha ao cadastrar');
    expect(component.formularioCliente.controls.nome.value).toBe('Ana Souza');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('em modo edição busca o cliente, preenche o formulário e envia PUT', async () => {
    await criar('3');
    http
      .expectOne(`${base}/buscar-cliente/3`)
      .flush(
        criarCliente({
          id: 3,
          nome: 'Oficina Oeste',
          tipoPessoa: 'PJ',
          cpfCnpj: '11.222.333/0001-81',
        }),
      );
    await fixture.whenStable();

    const f = component.formularioCliente;
    expect(f.controls.nome.value).toBe('Oficina Oeste');
    expect(f.controls.cpfCnpj.value).toBe('11222333000181');
    expect(f.controls.cidade.value).toEqual(CASCAVEL);
    expect((fixture.nativeElement.querySelector('#cpfCnpj') as HTMLInputElement).value).toBe(
      '11.222.333/0001-81',
    );

    f.controls.nome.setValue('Oficina Oeste Ltda');
    component.salvarCliente();
    const req = http.expectOne(`${base}/atualizar-cliente/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.nome).toBe('Oficina Oeste Ltda');
    req.flush(criarCliente({ id: 3 }));
    expect(router.navigate).toHaveBeenCalledWith(['/clientes']);
  });

  it('mostra erro quando o cliente da edição não pode ser carregado', async () => {
    await criar('99');
    http
      .expectOne(`${base}/buscar-cliente/99`)
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Não foi possível abrir o cliente',
    );
  });

  it('cancelar sem alterações volta direto; com alterações pede confirmação', async () => {
    await criar();
    const confirmacao = TestBed.inject(ConfirmationService);
    const confirmar = vi.spyOn(confirmacao, 'confirm');

    component.cancelar();
    expect(router.navigate).toHaveBeenCalledWith(['/clientes']);
    expect(confirmar).not.toHaveBeenCalled();

    component.formularioCliente.controls.nome.setValue('Alguém');
    component.formularioCliente.markAsDirty();
    component.cancelar();
    expect(confirmar).toHaveBeenCalledWith(
      expect.objectContaining({ header: 'Descartar alterações?' }),
    );
  });
});
