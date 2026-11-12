import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AutoGestaoPreset } from './core/tema/auto-gestao.preset';
import { TRADUCAO_PRIMENG } from './core/tema/traducao-primeng';
import { TituloPaginaStrategy } from './core/titulo-pagina.strategy';

registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideRouter(routes, withComponentInputBinding()),
    { provide: TitleStrategy, useExisting: TituloPaginaStrategy },
    provideClientHydration(),
    provideHttpClient(withFetch()),
    MessageService,
    ConfirmationService,
    providePrimeNG({
      theme: {
        preset: AutoGestaoPreset,
        options: {
          darkModeSelector: '.modo-escuro',
        },
      },
      translation: TRADUCAO_PRIMENG,
      ...(environment.primeuiLicense ? { license: environment.primeuiLicense } : {}),
    }),
  ],
};
