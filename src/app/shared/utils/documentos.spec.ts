import {
  cepValido,
  cnpjValido,
  cpfValido,
  formatarDocumento,
  formatarPorMascara,
  formatarTelefone,
  normalizarPorMascara,
  telefoneValido,
} from './documentos';

describe('documentos', () => {
  describe('cpfValido', () => {
    it('aceita CPF válido com ou sem máscara', () => {
      expect(cpfValido('529.982.247-25')).toBe(true);
      expect(cpfValido('52998224725')).toBe(true);
    });

    it('recusa dígito verificador errado, tamanho errado e dígitos repetidos', () => {
      expect(cpfValido('529.982.247-24')).toBe(false);
      expect(cpfValido('5299822472')).toBe(false);
      expect(cpfValido('111.111.111-11')).toBe(false);
      expect(cpfValido('')).toBe(false);
    });
  });

  describe('cnpjValido', () => {
    it('aceita CNPJ numérico', () => {
      expect(cnpjValido('11.222.333/0001-81')).toBe(true);
      expect(cnpjValido('11222333000181')).toBe(true);
    });

    it('aceita CNPJ alfanumérico (IN RFB 2.229/2024), inclusive em minúsculas', () => {
      expect(cnpjValido('12.ABC.345/01DE-35')).toBe(true);
      expect(cnpjValido('12abc34501de35')).toBe(true);
    });

    it('recusa dígitos verificadores errados, letras no DV e repetidos', () => {
      expect(cnpjValido('11.222.333/0001-82')).toBe(false);
      expect(cnpjValido('12.ABC.345/01DE-3A')).toBe(false);
      expect(cnpjValido('00.000.000/0000-00')).toBe(false);
      expect(cnpjValido('1122233300018')).toBe(false);
    });
  });

  describe('telefoneValido', () => {
    it('aceita fixo (10 dígitos) e celular (11 dígitos começando com 9)', () => {
      expect(telefoneValido('(45) 3222-1234')).toBe(true);
      expect(telefoneValido('45999990000')).toBe(true);
    });

    it('recusa DDD inválido, celular sem 9 e tamanhos errados', () => {
      expect(telefoneValido('(05) 3222-1234')).toBe(false);
      expect(telefoneValido('45899990000')).toBe(false);
      expect(telefoneValido('4599999')).toBe(false);
    });
  });

  it('cepValido exige 8 dígitos', () => {
    expect(cepValido('85810-000')).toBe(true);
    expect(cepValido('8581000')).toBe(false);
  });

  describe('máscaras', () => {
    it('formata progressivamente durante a digitação', () => {
      expect(formatarPorMascara('cpf', '529')).toBe('529');
      expect(formatarPorMascara('cpf', '5299822')).toBe('529.982.2');
      expect(formatarPorMascara('cpf', '52998224725')).toBe('529.982.247-25');
      expect(formatarPorMascara('cnpj', '11222333000181')).toBe('11.222.333/0001-81');
      expect(formatarPorMascara('cep', '85810000')).toBe('85810-000');
    });

    it('telefone alterna entre fixo e celular pelo tamanho', () => {
      expect(formatarPorMascara('telefone', '4532221234')).toBe('(45) 3222-1234');
      expect(formatarPorMascara('telefone', '45999990000')).toBe('(45) 99999-0000');
    });

    it('normaliza removendo pontuação e limitando o tamanho', () => {
      expect(normalizarPorMascara('cpf', '529.982.247-25999')).toBe('52998224725');
      expect(normalizarPorMascara('cep', 'abc85810-000')).toBe('85810000');
    });

    it('CNPJ aceita letras só nas 12 primeiras posições', () => {
      expect(normalizarPorMascara('cnpj', '12.abc.345/01de-35')).toBe('12ABC34501DE35');
      expect(normalizarPorMascara('cnpj', '12ABC34501DEXY')).toBe('12ABC34501DE');
    });
  });

  describe('formatação para exibição', () => {
    it('decide CPF ou CNPJ pelo tamanho', () => {
      expect(formatarDocumento('52998224725')).toBe('529.982.247-25');
      expect(formatarDocumento('11222333000181')).toBe('11.222.333/0001-81');
      expect(formatarDocumento('529.982.247-25')).toBe('529.982.247-25');
    });

    it('mantém valores fora do padrão como vieram da API', () => {
      expect(formatarDocumento('123')).toBe('123');
      expect(formatarDocumento(null)).toBe('');
      expect(formatarTelefone('0800')).toBe('0800');
    });
  });
});
