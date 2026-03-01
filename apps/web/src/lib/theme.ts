export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export function getThemeFromEnv(): ThemeConfig {
  const withHash = (c?: string, d = '') => c ? (c.startsWith('#') ? c : `#${c}`) : d;
  return {
    primaryColor: withHash(process.env.NEXT_PUBLIC_PRIMARY_COLOR, '#6366f1'),
    secondaryColor: withHash(process.env.NEXT_PUBLIC_SECONDARY_COLOR, '#ec4899'),
    backgroundColor: withHash(process.env.NEXT_PUBLIC_BACKGROUND_COLOR, '#f8fafc'),
    textColor: withHash(process.env.NEXT_PUBLIC_TEXT_COLOR, '#1e293b'),
    fontFamily: process.env.NEXT_PUBLIC_FONT_FAMILY || 'Manrope',
  };
}

export function generateThemeCSS(theme: ThemeConfig): string {
  return `
    :root {
      --color-primary: ${theme.primaryColor};
      --color-secondary: ${theme.secondaryColor};
      --color-background: ${theme.backgroundColor};
      --color-text: ${theme.textColor};
      --font-family: '${theme.fontFamily}', sans-serif;
    }
    body {
      font-family: var(--font-family);
      background-color: var(--color-background);
      color: var(--color-text);
    }
  `;
}
