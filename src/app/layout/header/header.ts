import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Car } from '@primeicons/angular/car';
import { User } from '@primeicons/angular/user';
import { Moon } from '@primeicons/angular/moon';
import { Sun } from '@primeicons/angular/sun';
import { PreferenciasService } from '../../core/services/preferencias-service';
import { NOME_SISTEMA, TituloPaginaStrategy } from '../../core/titulo-pagina.strategy';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Car, User, Moon, Sun],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly preferencias = inject(PreferenciasService);
  protected readonly titulo = inject(TituloPaginaStrategy).tituloAtual;
  protected readonly nomeSistema = NOME_SISTEMA;
}
