import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

/**
 * Para adicionar um módulo (ex.: Veículos, quando a API existir):
 * 1. crie a rota filha abaixo com `loadComponent`;
 * 2. inclua o item em `layout/navegacao.ts`.
 */
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'clientes',
        children: [
          {
            path: '',
            title: 'Clientes',
            loadComponent: () =>
              import('./components/cliente/cliente-listar/cliente-listar').then(
                (m) => m.ClienteListar,
              ),
          },
          {
            path: 'novo',
            title: 'Novo cliente',
            loadComponent: () =>
              import('./components/cliente/cliente-cadastrar/cliente-cadastrar').then(
                (m) => m.ClienteCadastrar,
              ),
          },
          {
            path: ':id/editar',
            title: 'Editar cliente',
            loadComponent: () =>
              import('./components/cliente/cliente-cadastrar/cliente-cadastrar').then(
                (m) => m.ClienteCadastrar,
              ),
          },
        ],
      },
      {
        path: 'configuracoes',
        title: 'Configurações',
        loadComponent: () =>
          import('./components/configuracoes/configuracoes').then((m) => m.Configuracoes),
      },
      {
        path: '**',
        title: 'Página não encontrada',
        loadComponent: () =>
          import('./components/nao-encontrada/nao-encontrada').then((m) => m.NaoEncontrada),
      },
    ],
  },
];
