import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Car } from '@primeicons/angular/car';
import { User } from '@primeicons/angular/user';
import { NOME_SISTEMA, TituloPaginaStrategy } from '../../core/titulo-pagina.strategy';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Car, User],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly titulo = inject(TituloPaginaStrategy).tituloAtual;
  protected readonly nomeSistema = NOME_SISTEMA;
}
