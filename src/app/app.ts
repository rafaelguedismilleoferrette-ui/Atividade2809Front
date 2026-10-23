import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Raiz da aplicação: apenas o roteador. O layout fica em `layout/main-layout`. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
