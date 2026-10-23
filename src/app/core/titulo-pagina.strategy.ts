import { Service, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const NOME_SISTEMA = 'Auto Gestão';

/**
 * Usa o `title` das rotas para o título da aba ("Clientes · Auto Gestão") e
 * expõe o título atual para o cabeçalho, evitando duplicar essa lógica.
 */
@Service()
export class TituloPaginaStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  readonly tituloAtual = signal('');

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const titulo = this.buildTitle(snapshot) ?? '';
    this.tituloAtual.set(titulo);
    this.title.setTitle(titulo ? `${titulo} · ${NOME_SISTEMA}` : NOME_SISTEMA);
  }
}
