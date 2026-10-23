import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Tema Aura com a paleta da Auto Gestão.
 * As variáveis CSS equivalentes (para o layout) estão em `src/styles.css`.
 */
export const AutoGestaoPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eef4fb',
      100: '#d9e6f5',
      200: '#b6cdea',
      300: '#86abd9',
      400: '#3a6fb0',
      500: '#23599d',
      600: '#1e4c87',
      700: '#1a4071',
      800: '#17345c',
      900: '#17263b',
      950: '#0e1826',
    },
    typography: {
      fontSize: '0.9375rem',
    },
    text: {
      color: '#1c344d',
      hoverColor: '#17263b',
      mutedColor: '#62748a',
      hoverMutedColor: '#4f6177',
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.400}',
      offset: '2px',
      shadow: 'none',
    },
    formField: {
      borderRadius: '10px',
      paddingY: '0.5625rem',
      paddingX: '0.75rem',
      background: 'rgba(255, 255, 255, 0.86)',
      borderColor: 'rgba(28, 52, 77, 0.2)',
      hoverBorderColor: 'rgba(28, 52, 77, 0.36)',
      focusRing: {
        width: '0',
        style: 'none',
        color: 'transparent',
        offset: '0',
        shadow: '0 0 0 3px rgba(58, 111, 176, 0.28)',
      },
    },
    content: {
      borderRadius: '12px',
    },
  },
  components: {
    datatable: {
      header: { background: 'transparent' },
      headerCell: {
        background: 'transparent',
        hoverBackground: 'rgba(35, 89, 157, 0.06)',
        selectedBackground: 'rgba(35, 89, 157, 0.08)',
        borderColor: 'rgba(28, 52, 77, 0.1)',
        color: '#62748a',
        hoverColor: '#1c344d',
        selectedColor: '#23599d',
      },
      row: {
        background: 'transparent',
        hoverBackground: 'rgba(35, 89, 157, 0.05)',
        color: '#1c344d',
      },
      bodyCell: { borderColor: 'rgba(28, 52, 77, 0.08)' },
      footer: { background: 'transparent' },
    },
    paginator: {
      root: { background: 'transparent' },
    },
  },
});
