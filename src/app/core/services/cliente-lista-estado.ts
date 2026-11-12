import { Service, signal } from '@angular/core';
import { TipoPessoa } from '../models/cliente.model';

@Service()
export class ClienteListaEstado {
  readonly busca = signal('');
  readonly tipo = signal<TipoPessoa | null>(null);
  readonly cidadeId = signal<number | null>(null);
  readonly uf = signal<string | null>(null);
  readonly somenteIncompletos = signal(false);
  readonly primeiro = signal(0);
  readonly campoOrdem = signal('nome');
  readonly ordem = signal(1);

  limpar(): void {
    this.busca.set('');
    this.tipo.set(null);
    this.cidadeId.set(null);
    this.uf.set(null);
    this.somenteIncompletos.set(false);
    this.primeiro.set(0);
  }
}
