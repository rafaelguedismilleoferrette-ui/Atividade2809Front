import { TestBed } from '@angular/core/testing';
import { PreferenciasService } from './preferencias-service';

describe('PreferenciasService', () => {
  const chave = 'auto-gestao:preferencias';

  beforeEach(() => localStorage.removeItem(chave));
  afterEach(() => {
    localStorage.removeItem(chave);
    document.documentElement.classList.remove('modo-escuro');
  });

  it('aplica o tema salvo e mantém as outras preferências', () => {
    localStorage.setItem(
      chave,
      JSON.stringify({ modoEscuro: true, itensPorPagina: 20, menuRecolhido: true }),
    );
    const service = TestBed.inject(PreferenciasService);
    TestBed.tick();
    expect(service.modoEscuro()).toBe(true);
    expect(service.itensPorPagina()).toBe(20);
    expect(document.documentElement.classList.contains('modo-escuro')).toBe(true);
  });

  it('grava a troca de tema e restaura o modo claro', () => {
    const service = TestBed.inject(PreferenciasService);
    service.modoEscuro.set(true);
    TestBed.tick();
    expect(JSON.parse(localStorage.getItem(chave)!).modoEscuro).toBe(true);
    service.restaurarPadrao();
    TestBed.tick();
    expect(document.documentElement.classList.contains('modo-escuro')).toBe(false);
    expect(JSON.parse(localStorage.getItem(chave)!).modoEscuro).toBe(false);
  });

  it('abre no modo claro se a preferência salva for inválida', () => {
    localStorage.setItem(chave, '{invalido');
    const service = TestBed.inject(PreferenciasService);
    expect(service.modoEscuro()).toBe(false);
    expect(service.itensPorPagina()).toBe(10);
  });
});
