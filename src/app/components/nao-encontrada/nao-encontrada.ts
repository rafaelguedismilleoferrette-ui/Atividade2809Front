import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowLeft } from '@primeicons/angular/arrow-left';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-nao-encontrada',
  imports: [RouterLink, ButtonDirective, ArrowLeft],
  template: `
    <section class="glass-panel nao-encontrada" aria-labelledby="titulo-404">
      <p class="nao-encontrada__codigo" aria-hidden="true">404</p>
      <h1 id="titulo-404" tabindex="-1">Página não encontrada</h1>
      <p class="texto-secundario">O endereço acessado não existe ou foi movido.</p>
      <a pButton routerLink="/dashboard">
        <svg data-p-icon="arrow-left" size="16"></svg>
        Voltar ao dashboard
      </a>
    </section>
  `,
  styles: `
    .nao-encontrada {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--ag-space-3);
      max-width: 560px;
      margin: var(--ag-space-12) auto;
      padding: var(--ag-space-10) var(--ag-space-6);
      text-align: center;
    }
    .nao-encontrada__codigo {
      margin: 0;
      font-size: 4rem;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.04em;
      background: linear-gradient(135deg, var(--ag-navy), var(--ag-accent));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    h1 {
      margin: 0;
      font-size: 1.5rem;
      outline: none;
    }
    p {
      margin: 0 0 var(--ag-space-3);
    }
  `,
})
export class NaoEncontrada {}
