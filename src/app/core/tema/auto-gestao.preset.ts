import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const coresDoTema = {
  text: {
    color: 'var(--ag-text)',
    hoverColor: 'var(--ag-navy)',
    mutedColor: 'var(--ag-text-secondary)',
    hoverMutedColor: 'var(--ag-text)',
  },
  formField: {
    background: 'var(--ag-input-bg)',
    borderColor: 'var(--ag-input-border)',
    hoverBorderColor: 'var(--ag-accent)',
    focusBorderColor: 'var(--ag-primary)',
    color: 'var(--ag-text)',
    placeholderColor: 'var(--ag-text-secondary)',
  },
  content: {
    background: 'var(--ag-surface)',
    borderColor: 'var(--ag-divider)',
    color: 'var(--ag-text)',
  },
};

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
    typography: { fontSize: '0.9375rem' },
    colorScheme: { light: coresDoTema, dark: coresDoTema },
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
      focusRing: {
        width: '0',
        style: 'none',
        color: 'transparent',
        offset: '0',
        shadow: '0 0 0 3px rgba(58, 111, 176, 0.28)',
      },
    },
    content: { borderRadius: '12px' },
  },
  components: {
    datatable: {
      header: { background: 'transparent' },
      headerCell: {
        background: 'transparent',
        hoverBackground: 'var(--ag-primary-softer)',
        selectedBackground: 'var(--ag-primary-soft)',
        borderColor: 'var(--ag-divider)',
        color: 'var(--ag-text-secondary)',
        hoverColor: 'var(--ag-text)',
        selectedColor: 'var(--ag-primary)',
      },
      row: {
        background: 'transparent',
        hoverBackground: 'var(--ag-primary-softer)',
        color: 'var(--ag-text)',
      },
      bodyCell: { borderColor: 'var(--ag-divider)' },
      footer: { background: 'transparent' },
    },
    paginator: { root: { background: 'transparent' } },
  },
});
