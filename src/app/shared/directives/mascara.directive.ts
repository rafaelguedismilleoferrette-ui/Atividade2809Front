import { Directive, ElementRef, forwardRef, inject, input, effect } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  formatarPorMascara,
  normalizarPorMascara,
  TAMANHO_FORMATADO,
  TipoMascara,
} from '../utils/documentos';

/**
 * Máscara de digitação para CPF, CNPJ, telefone e CEP.
 *
 * O campo exibe o valor formatado e o FormControl recebe o valor normalizado
 * (sem pontuação), que é o que a API armazena. Trocar o tipo em tempo de
 * execução (ex.: CPF → CNPJ) reformata o que já foi digitado.
 *
 * Uso: `<input formControlName="cpfCnpj" [appMascara]="'cpf'" />`
 */
@Directive({
  selector: 'input[appMascara]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MascaraDirective), multi: true },
  ],
  host: {
    '(input)': 'aoDigitar()',
    '(blur)': 'aoSair()',
    '[attr.maxlength]': 'tamanhoMaximo()',
    '[attr.inputmode]': 'modoTeclado()',
    '[attr.autocapitalize]': "appMascara() === 'cnpj' ? 'characters' : null",
  },
})
export class MascaraDirective implements ControlValueAccessor {
  readonly appMascara = input<TipoMascara>('cpf');

  private readonly elemento = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private valorNormalizado = '';
  private aoAlterar: (valor: string) => void = () => {};
  private aoTocar: () => void = () => {};

  constructor() {
    // Reaplica a máscara quando o tipo muda (PF ↔ PJ).
    effect(() => {
      const tipo = this.appMascara();
      const normalizado = normalizarPorMascara(tipo, this.valorNormalizado);
      this.elemento.value = formatarPorMascara(tipo, normalizado);
      if (normalizado !== this.valorNormalizado) {
        this.valorNormalizado = normalizado;
        this.aoAlterar(normalizado);
      }
    });
  }

  protected tamanhoMaximo(): number {
    return TAMANHO_FORMATADO[this.appMascara()];
  }

  protected modoTeclado(): string {
    if (this.appMascara() === 'cnpj') {
      return 'text';
    }
    return this.appMascara() === 'telefone' ? 'tel' : 'numeric';
  }

  writeValue(valor: string | null): void {
    this.valorNormalizado = normalizarPorMascara(this.appMascara(), valor);
    this.elemento.value = formatarPorMascara(this.appMascara(), this.valorNormalizado);
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.aoAlterar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.elemento.disabled = desabilitado;
  }

  protected aoDigitar(): void {
    const tipo = this.appMascara();
    const digitado = this.elemento.value;
    const cursor = this.elemento.selectionStart ?? digitado.length;
    // Quantos caracteres significativos existem antes do cursor.
    const significativosAntes = normalizarPorMascara(tipo, digitado.slice(0, cursor)).length;

    this.valorNormalizado = normalizarPorMascara(tipo, digitado);
    const formatado = formatarPorMascara(tipo, this.valorNormalizado);
    this.elemento.value = formatado;
    this.posicionarCursor(formatado, significativosAntes, cursor === digitado.length);
    this.aoAlterar(this.valorNormalizado);
  }

  protected aoSair(): void {
    this.aoTocar();
  }

  private posicionarCursor(formatado: string, significativos: number, noFim: boolean): void {
    if (noFim || this.elemento.ownerDocument.activeElement !== this.elemento) {
      return;
    }
    let posicao = 0;
    let contados = 0;
    while (posicao < formatado.length && contados < significativos) {
      if (/[0-9A-Z]/.test(formatado[posicao])) {
        contados++;
      }
      posicao++;
    }
    this.elemento.setSelectionRange(posicao, posicao);
  }
}
