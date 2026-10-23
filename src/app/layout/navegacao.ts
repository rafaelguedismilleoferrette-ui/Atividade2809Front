/** Ícones usados no menu (cada um é importado no SidebarComponent). */
export type IconeNavegacao = 'objects-column' | 'users' | 'car' | 'cog';

export interface ItemNavegacao {
  rotulo: string;
  rota: string;
  icone: IconeNavegacao;
}

export interface GrupoNavegacao {
  titulo: string;
  itens: ItemNavegacao[];
}

/**
 * Itens do menu lateral. Só entram aqui módulos com API real no backend.
 * Veículos, Vendas e Ordens de Serviço serão adicionados quando existirem
 * os controllers correspondentes (ver README → "Próximos módulos").
 */
export const NAVEGACAO: GrupoNavegacao[] = [
  {
    titulo: 'Principal',
    itens: [
      { rotulo: 'Dashboard', rota: '/dashboard', icone: 'objects-column' },
      { rotulo: 'Clientes', rota: '/clientes', icone: 'users' },
      { rotulo: 'Marcas', rota: '/marcas', icone: 'car' },
    ],
  },
  {
    titulo: 'Sistema',
    itens: [{ rotulo: 'Configurações', rota: '/configuracoes', icone: 'cog' }],
  },
];
