import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArrowLeft } from '@primeicons/angular/arrow-left';
import { ExclamationCircle } from '@primeicons/angular/exclamation-circle';
import { IdCard } from '@primeicons/angular/id-card';
import { MapMarker } from '@primeicons/angular/map-marker';
import { Phone } from '@primeicons/angular/phone';
import { Refresh } from '@primeicons/angular/refresh';
import { Save } from '@primeicons/angular/save';
import { Spinner } from '@primeicons/angular/spinner';
import { Times } from '@primeicons/angular/times';
import { ConfirmationService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { mensagemErroHttp } from '../../../core/http/erro-api';
import { Cidade } from '../../../core/models/cidade.model';
import { Cliente, TIPOS_PESSOA, TipoPessoa } from '../../../core/models/cliente.model';
import { ClienteService } from '../../../core/services/cliente-service';
import { NotificacaoService } from '../../../core/services/notificacao-service';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { EstadoPainel } from '../../../shared/components/estado-painel/estado-painel';
import { MascaraDirective } from '../../../shared/directives/mascara.directive';
import {
  cepValidator,
  cidadeSelecionadaValidator,
  cnpjValidator,
  cpfValidator,
  emailCompletoValidator,
  naoSomenteEspacosValidator,
  telefoneValidator,
} from '../../../shared/validators/cliente-validators';
import { CidadeSeletor } from '../../cidade/cidade-seletor/cidade-seletor';
import {
  clienteParaFormulario,
  montarPayloadCliente,
  tipoMascaraDocumento,
} from './cliente-payload';

type FormularioCliente = FormGroup<{
  nome: FormControl<string>;
  tipoPessoa: FormControl<TipoPessoa | null>;
  cpfCnpj: FormControl<string>;
  telefone: FormControl<string>;
  email: FormControl<string>;
  cep: FormControl<string>;
  logradouro: FormControl<string>;
  numero: FormControl<string>;
  bairro: FormControl<string>;
  cidade: FormControl<Cidade | string | null>;
}>;

export type CampoCliente = keyof FormularioCliente['controls'];

/** Mensagem para o validador `required` de cada campo. */
const MENSAGEM_OBRIGATORIO: Record<CampoCliente, string> = {
  nome: 'Informe o nome.',
  tipoPessoa: 'Selecione o tipo de pessoa.',
  cpfCnpj: 'Informe o documento.',
  telefone: 'Informe o telefone.',
  email: 'Informe o e-mail.',
  cep: 'Informe o CEP.',
  logradouro: 'Informe o logradouro.',
  numero: 'Informe o número (use "S/N" se não houver).',
  bairro: 'Informe o bairro.',
  cidade: 'Selecione a cidade.',
};

/**
 * Cadastro e edição de clientes (rotas `/clientes/novo` e `/clientes/:id/editar`).
 */
@Component({
  selector: 'app-cliente-cadastrar',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    SelectModule,
    ButtonDirective,
    Skeleton,
    MascaraDirective,
    CidadeSeletor,
    CabecalhoPagina,
    EstadoPainel,
    ArrowLeft,
    ExclamationCircle,
    IdCard,
    MapMarker,
    Phone,
    Refresh,
    Save,
    Spinner,
    Times,
  ],
  templateUrl: './cliente-cadastrar.html',
  styleUrl: './cliente-cadastrar.css',
})
export class ClienteCadastrar implements OnInit {
  /** Parâmetro `:id` da rota (ligado via `withComponentInputBinding`). */
  readonly id = input<string>();

  formularioCliente!: FormularioCliente;

  tipoPessoaOptions = [...TIPOS_PESSOA];

  protected readonly modoEdicao = computed(() => !!this.id());
  protected readonly carregando = signal(false);
  protected readonly erroCarregamento = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly tentouEnviar = signal(false);
  protected readonly tipoSelecionado = signal<TipoPessoa | null>(null);

  protected readonly mascaraDocumento = computed(() =>
    tipoMascaraDocumento(this.tipoSelecionado()),
  );
  protected readonly rotuloDocumento = computed(() => {
    const tipo = this.tipoSelecionado();
    return tipo === 'PJ' ? 'CNPJ' : tipo === 'PF' ? 'CPF' : 'CPF/CNPJ';
  });

  private readonly clienteService = inject(ClienteService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly confirmacao = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor(private readonly criadorFormulario: FormBuilder) {}

  ngOnInit(): void {
    this.criarFormularioCliente();
    if (this.modoEdicao()) {
      this.carregarCliente();
    }
  }

  criarFormularioCliente(): void {
    const campos = this.criadorFormulario.nonNullable;
    const obrigatorioTexto = [Validators.required, naoSomenteEspacosValidator];

    this.formularioCliente = campos.group({
      nome: ['', [...obrigatorioTexto, Validators.minLength(3), Validators.maxLength(100)]],
      tipoPessoa: new FormControl<TipoPessoa | null>(null, Validators.required),
      // Habilitado quando o tipo de pessoa é escolhido (define a máscara).
      cpfCnpj: [{ value: '', disabled: true }, Validators.required],
      telefone: ['', [Validators.required, telefoneValidator]],
      email: [
        '',
        [Validators.required, Validators.email, emailCompletoValidator, Validators.maxLength(120)],
      ],
      cep: ['', [Validators.required, cepValidator]],
      logradouro: ['', [...obrigatorioTexto, Validators.minLength(3), Validators.maxLength(120)]],
      numero: ['', [...obrigatorioTexto, Validators.maxLength(10)]],
      bairro: ['', [...obrigatorioTexto, Validators.minLength(2), Validators.maxLength(80)]],
      cidade: new FormControl<Cidade | string | null>(null, [
        Validators.required,
        cidadeSelecionadaValidator,
      ]),
    });

    this.formularioCliente.controls.tipoPessoa.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo) => this.aplicarTipoPessoa(tipo));
  }

  /** Troca máscara e validador do documento (CPF para PF, CNPJ para PJ). */
  private aplicarTipoPessoa(tipo: TipoPessoa | null): void {
    this.tipoSelecionado.set(tipo);
    const documento = this.formularioCliente.controls.cpfCnpj;
    if (!tipo) {
      documento.disable({ emitEvent: false });
      return;
    }
    documento.setValidators([Validators.required, tipo === 'PJ' ? cnpjValidator : cpfValidator]);
    documento.enable({ emitEvent: false });
    documento.updateValueAndValidity({ emitEvent: false });
  }

  carregarCliente(): void {
    const id = Number(this.id());
    if (!Number.isInteger(id) || id <= 0) {
      this.erroCarregamento.set('O identificador informado na URL não é válido.');
      return;
    }
    this.carregando.set(true);
    this.erroCarregamento.set(null);
    this.clienteService.buscarClientePorId(id).subscribe({
      next: (cliente) => {
        this.preencherFormulario(cliente);
        this.carregando.set(false);
      },
      error: (erro: unknown) => {
        this.erroCarregamento.set(
          mensagemErroHttp(erro, 'Verifique se o cliente ainda existe na lista.'),
        );
        this.carregando.set(false);
      },
    });
  }

  private preencherFormulario(cliente: Cliente): void {
    const valores = clienteParaFormulario(cliente);
    // O tipo vem primeiro para habilitar o documento com a máscara certa.
    this.formularioCliente.controls.tipoPessoa.setValue(valores.tipoPessoa);
    this.formularioCliente.patchValue(valores);
    this.formularioCliente.markAsPristine();
    this.formularioCliente.markAsUntouched();
  }

  salvarCliente(): void {
    if (this.enviando()) {
      return;
    }
    this.tentouEnviar.set(true);
    this.formularioCliente.markAllAsTouched();

    if (this.formularioCliente.invalid) {
      this.notificacao.aviso(
        'Revise os campos destacados antes de salvar.',
        'Formulário incompleto',
      );
      this.focarPrimeiroCampoInvalido();
      return;
    }

    const cliente = montarPayloadCliente(this.formularioCliente.getRawValue());
    const edicao = this.modoEdicao();
    const requisicao = edicao
      ? this.clienteService.atualizarCliente(Number(this.id()), cliente)
      : this.clienteService.salvarCliente(cliente);

    this.enviando.set(true);
    requisicao.subscribe({
      next: () => {
        this.enviando.set(false);
        this.formularioCliente.markAsPristine();
        this.notificacao.sucesso(
          `${cliente.nome} foi ${edicao ? 'atualizado' : 'cadastrado'} com sucesso.`,
          edicao ? 'Cliente atualizado' : 'Cliente cadastrado',
        );
        this.router.navigate(['/clientes']);
      },
      error: (erro: unknown) => {
        // Os dados digitados permanecem no formulário para nova tentativa.
        this.enviando.set(false);
        this.notificacao.erro(
          mensagemErroHttp(erro, 'Uma causa comum é CPF/CNPJ já cadastrado para outro cliente.'),
          edicao ? 'Falha ao atualizar' : 'Falha ao cadastrar',
        );
      },
    });
  }

  cancelar(): void {
    if (!this.formularioCliente.dirty || this.enviando()) {
      this.voltarParaLista();
      return;
    }
    this.confirmacao.confirm({
      header: 'Descartar alterações?',
      message: 'As informações preenchidas neste formulário serão perdidas.',
      acceptLabel: 'Descartar',
      rejectLabel: 'Continuar editando',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      defaultFocus: 'reject',
      accept: () => this.voltarParaLista(),
    });
  }

  /** Mensagem de erro do campo, exibida após interação ou tentativa de envio. */
  protected erroDe(campo: CampoCliente): string | null {
    const controle = this.formularioCliente.controls[campo];
    const erros = controle.errors;
    if (!erros || !(controle.touched || this.tentouEnviar())) {
      return null;
    }
    if (erros['required']) {
      return campo === 'cpfCnpj'
        ? `Informe o ${this.rotuloDocumento()}.`
        : MENSAGEM_OBRIGATORIO[campo];
    }
    if (erros['minlength']) {
      return `Use pelo menos ${erros['minlength'].requiredLength} caracteres.`;
    }
    if (erros['maxlength']) {
      return `Use no máximo ${erros['maxlength'].requiredLength} caracteres.`;
    }
    if (erros['email']) {
      return 'Informe um e-mail válido, como nome@empresa.com.br.';
    }
    if (erros['cpf']) {
      return 'CPF inválido. Confira os 11 dígitos.';
    }
    if (erros['cnpj']) {
      return 'CNPJ inválido. Confira os 14 caracteres.';
    }
    if (erros['telefone']) {
      return 'Telefone inválido. Use DDD + número (celulares começam com 9).';
    }
    if (erros['cep']) {
      return 'O CEP deve ter 8 dígitos.';
    }
    if (erros['cidadeNaoSelecionada']) {
      return 'Selecione uma cidade da lista de resultados.';
    }
    return 'Valor inválido.';
  }

  private voltarParaLista(): void {
    this.router.navigate(['/clientes']);
  }

  private focarPrimeiroCampoInvalido(): void {
    const invalido = this.elemento.nativeElement.querySelector<HTMLElement>(
      '.campo .ng-invalid:not(form)',
    );
    const alvo = invalido?.matches('input')
      ? invalido
      : invalido?.querySelector<HTMLElement>('input, [role="combobox"], [tabindex="0"]');
    alvo?.focus();
  }
}
