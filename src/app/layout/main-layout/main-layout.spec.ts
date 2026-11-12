import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

import { MainLayout } from './main-layout';

@Component({ template: '<h1 tabindex="-1">Página</h1>' })
class PaginaFalsa {}

function simularTela(largura: number) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (consulta: string) => {
      const max = /max-width:\s*([\d.]+)px/.exec(consulta);
      const min = /min-width:\s*([\d.]+)px/.exec(consulta);
      const matches = max ? largura <= Number(max[1]) : min ? largura >= Number(min[1]) : false;
      return {
        matches,
        media: consulta,
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as MediaQueryList;
    },
  });
}

describe('MainLayout (menu lateral)', () => {
  async function criar(largura: number) {
    simularTela(largura);
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([
          { path: 'dashboard', component: PaginaFalsa },
          { path: 'clientes', component: PaginaFalsa },
        ]),
        MessageService,
        ConfirmationService,
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(MainLayout);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      el,
      botao: el.querySelector<HTMLButtonElement>('#botao-menu')!,
      menu: el.querySelector<HTMLElement>('#menu-lateral')!,
    };
  }

  afterEach(() => {
    delete (window as Partial<Window>).matchMedia;
    document.body.classList.remove('ag-scroll-bloqueado');
    document.documentElement.classList.remove('modo-escuro');
    localStorage.removeItem('auto-gestao:preferencias');
  });

  it('tem um único cabeçalho, um menu e a área de conteúdo', async () => {
    const { el } = await criar(1440);
    expect(el.querySelectorAll('app-header')).toHaveLength(1);
    expect(el.querySelectorAll('nav#menu-lateral')).toHaveLength(1);
    expect(el.querySelector('main#conteudo-principal router-outlet')).not.toBeNull();
    expect(el.textContent).toContain('Dashboard');
    expect(el.textContent).toContain('Clientes');
    expect(el.textContent).not.toContain('Veículos');
  });

  it('o controle do menu é a seta na lateral, não um botão no cabeçalho', async () => {
    const { el, botao } = await criar(1440);
    expect(el.querySelector('app-header button[aria-controls="menu-lateral"]')).toBeNull();
    expect(el.querySelector('app-header button[aria-label="Ativar modo escuro"]')).not.toBeNull();
    expect(botao.closest('app-sidebar')).not.toBeNull();
    expect(botao.querySelector('svg.alternador__seta')).not.toBeNull();
  });

  it('alterna o tema pelo cabeçalho e atualiza o rótulo do botão', async () => {
    const { el, fixture } = await criar(1440);
    el.querySelector<HTMLButtonElement>('button[aria-label="Ativar modo escuro"]')!.click();
    await fixture.whenStable();
    expect(document.documentElement.classList.contains('modo-escuro')).toBe(true);
    const botao = el.querySelector<HTMLButtonElement>('button[aria-label="Ativar modo claro"]')!;
    expect(botao.getAttribute('aria-pressed')).toBe('true');
    botao.click();
    await fixture.whenStable();
    expect(document.documentElement.classList.contains('modo-escuro')).toBe(false);
  });

  describe('no desktop', () => {
    it('inicia expandido e o hambúrguer recolhe/expande liberando espaço', async () => {
      const { fixture, el, botao, menu } = await criar(1440);
      expect(botao.getAttribute('aria-controls')).toBe('menu-lateral');
      expect(botao.getAttribute('aria-expanded')).toBe('true');
      expect(botao.getAttribute('aria-label')).toBe('Recolher menu');
      expect(menu.classList).not.toContain('sidebar--recolhido');

      botao.click();
      await fixture.whenStable();
      expect(botao.getAttribute('aria-expanded')).toBe('false');
      expect(menu.classList).toContain('sidebar--recolhido');
      expect(el.querySelector('.corpo')?.classList).toContain('corpo--recolhido');

      botao.click();
      await fixture.whenStable();
      expect(botao.getAttribute('aria-expanded')).toBe('true');
      expect(menu.classList).not.toContain('sidebar--recolhido');
    });

    it('em telas médias (notebook) inicia recolhido para dar espaço ao conteúdo', async () => {
      const { botao, menu } = await criar(1100);
      expect(botao.getAttribute('aria-expanded')).toBe('false');
      expect(menu.classList).toContain('sidebar--recolhido');
    });

    it('não usa overlay', async () => {
      const { el } = await criar(1440);
      expect(el.querySelector('[data-testid="overlay-menu"]')).toBeNull();
    });
  });

  describe('no celular', () => {
    it('inicia fechado, fora da navegação por teclado', async () => {
      const { botao, menu } = await criar(390);
      expect(botao.getAttribute('aria-expanded')).toBe('false');
      expect(botao.getAttribute('aria-label')).toBe('Abrir menu');
      expect(menu.classList).toContain('sidebar--gaveta');
      expect(menu.hasAttribute('inert')).toBe(true);
    });

    it('abre a gaveta com overlay e trava a rolagem do fundo', async () => {
      const { fixture, el, botao, menu } = await criar(390);
      botao.click();
      await fixture.whenStable();

      expect(botao.getAttribute('aria-expanded')).toBe('true');
      expect(menu.classList).toContain('sidebar--aberta');
      expect(menu.hasAttribute('inert')).toBe(false);
      expect(el.querySelector('[data-testid="overlay-menu"]')?.classList).toContain(
        'overlay--visivel',
      );
      expect(document.body.classList).toContain('ag-scroll-bloqueado');
    });

    it('fecha pelo overlay', async () => {
      const { fixture, el, botao, menu } = await criar(390);
      botao.click();
      await fixture.whenStable();

      el.querySelector<HTMLElement>('[data-testid="overlay-menu"]')!.click();
      await fixture.whenStable();
      expect(menu.classList).not.toContain('sidebar--aberta');
      expect(document.body.classList).not.toContain('ag-scroll-bloqueado');
    });

    it('fecha com Escape e devolve o foco ao botão do menu', async () => {
      const { fixture, botao, menu } = await criar(390);
      botao.click();
      await fixture.whenStable();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await fixture.whenStable();
      expect(menu.classList).not.toContain('sidebar--aberta');
      expect(document.activeElement).toBe(botao);
    });

    it('fecha pelo botão "Fechar menu"', async () => {
      const { fixture, el, botao, menu } = await criar(390);
      botao.click();
      await fixture.whenStable();

      el.querySelector<HTMLButtonElement>('button[aria-label="Fechar menu"]')!.click();
      await fixture.whenStable();
      expect(menu.classList).not.toContain('sidebar--aberta');
    });

    it('fecha ao selecionar uma rota', async () => {
      const { fixture, el, botao, menu } = await criar(390);
      botao.click();
      await fixture.whenStable();

      el.querySelector<HTMLAnchorElement>('a[href="/clientes"]')!.click();
      await fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe('/clientes');
      expect(menu.classList).not.toContain('sidebar--aberta');
      expect(botao.getAttribute('aria-expanded')).toBe('false');
    });
  });
});
