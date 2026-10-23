import { inject, Service } from '@angular/core';
import { MessageService } from 'primeng/api';

/** Atalhos em português para os toasts do PrimeNG (`<p-toast>` fica no layout). */
@Service()
export class NotificacaoService {
  private readonly mensagens = inject(MessageService);

  sucesso(detalhe: string, titulo = 'Tudo certo'): void {
    this.mensagens.add({ severity: 'success', summary: titulo, detail: detalhe, life: 4000 });
  }

  erro(detalhe: string, titulo = 'Não foi possível concluir'): void {
    this.mensagens.add({ severity: 'error', summary: titulo, detail: detalhe, life: 7000 });
  }

  aviso(detalhe: string, titulo = 'Atenção'): void {
    this.mensagens.add({ severity: 'warn', summary: titulo, detail: detalhe, life: 5000 });
  }
}
