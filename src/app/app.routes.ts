import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

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
          {
            path: ':id',
            title: 'Ficha do cliente',
            loadComponent: () =>
              import('./components/cliente/cliente-detalhes/cliente-detalhes').then(
                (m) => m.ClienteDetalhes,
              ),
          },
        ],
      },
      {
        path: 'marcas',
        title: 'Marcas',
        loadComponent: () => import('./components/marca/marca-listar').then((m) => m.MarcaListar),
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
