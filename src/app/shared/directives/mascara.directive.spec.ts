import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TipoMascara } from '../utils/documentos';
import { MascaraDirective } from './mascara.directive';

@Component({
  imports: [ReactiveFormsModule, MascaraDirective],
  template: `<input [formControl]="controle" [appMascara]="tipo()" />`,
})
class Hospedeiro {
  readonly controle = new FormControl('');
  readonly tipo = signal<TipoMascara>('cpf');
}

describe('MascaraDirective', () => {
  async function criar() {
    const fixture = TestBed.createComponent(Hospedeiro);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const digitar = async (texto: string) => {
      input.value = texto;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    return { fixture, input, digitar, host: fixture.componentInstance };
  }

  it('exibe o valor formatado e entrega o valor sem máscara ao FormControl', async () => {
    const { input, digitar, host } = await criar();
    await digitar('52998224725');
    expect(input.value).toBe('529.982.247-25');
    expect(host.controle.value).toBe('52998224725');
  });

  it('formata valores vindos do FormControl (modo edição)', async () => {
    const { fixture, input, host } = await criar();
    host.controle.setValue('52998224725');
    await fixture.whenStable();
    expect(input.value).toBe('529.982.247-25');
  });

  it('reaplica a máscara quando o tipo muda de CPF para CNPJ', async () => {
    const { fixture, input, digitar, host } = await criar();
    await digitar('11222333000181');
    expect(host.controle.value).toBe('11222333000');

    host.tipo.set('cnpj');
    await fixture.whenStable();
    await digitar('11222333000181');
    expect(input.value).toBe('11.222.333/0001-81');
    expect(input.getAttribute('maxlength')).toBe('18');
  });
});
