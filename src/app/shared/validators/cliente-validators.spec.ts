import { FormControl } from '@angular/forms';
import {
  cidadeSelecionadaValidator,
  cnpjValidator,
  cpfValidator,
  emailCompletoValidator,
  naoSomenteEspacosValidator,
  telefoneValidator,
} from './cliente-validators';

describe('cliente-validators', () => {
  it('deixa campos vazios para o Validators.required', () => {
    expect(cpfValidator(new FormControl(''))).toBeNull();
    expect(cnpjValidator(new FormControl(null))).toBeNull();
    expect(telefoneValidator(new FormControl(''))).toBeNull();
  });

  it('marca CPF e CNPJ inválidos com chaves próprias', () => {
    expect(cpfValidator(new FormControl('12345678900'))).toEqual({ cpf: true });
    expect(cpfValidator(new FormControl('52998224725'))).toBeNull();
    expect(cnpjValidator(new FormControl('11222333000100'))).toEqual({ cnpj: true });
    expect(cnpjValidator(new FormControl('11222333000181'))).toBeNull();
  });

  it('exige domínio com extensão no e-mail', () => {
    expect(emailCompletoValidator(new FormControl('ana@empresa'))).toEqual({ email: true });
    expect(emailCompletoValidator(new FormControl('ana empresa.com'))).toEqual({ email: true });
    expect(emailCompletoValidator(new FormControl('ana@empresa.com.br'))).toBeNull();
  });

  it('trata texto só com espaços como obrigatório', () => {
    expect(naoSomenteEspacosValidator(new FormControl('   '))).toEqual({ required: true });
    expect(naoSomenteEspacosValidator(new FormControl(' Ana '))).toBeNull();
  });

  it('cidade só é válida quando um objeto com id foi selecionado', () => {
    expect(cidadeSelecionadaValidator(new FormControl('Cascavel'))).toEqual({
      cidadeNaoSelecionada: true,
    });
    expect(cidadeSelecionadaValidator(new FormControl({ id: 2853, nome: 'Cascavel' }))).toBeNull();
    expect(cidadeSelecionadaValidator(new FormControl(null))).toBeNull();
  });
});
