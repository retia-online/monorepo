export interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
}

export function getThemeFromEnv(): ThemeConfig {
    return {
        primaryColor: process.env.PRIMARY_COLOR || '#3b82f6',
        secondaryColor: process.env.SECONDARY_COLOR || '#10b981',
        backgroundColor: process.env.BACKGROUND_COLOR || '#ffffff',
        textColor: process.env.TEXT_COLOR || '#1f2937',
        fontFamily: process.env.FONT_FAMILY || 'Inter',
    };
}

export function generateThemeCSS(theme: ThemeConfig): string {
    return `
    :root {
      --primary-color: ${theme.primaryColor};
      --secondary-color: ${theme.secondaryColor};
      --background-color: ${theme.backgroundColor};
      --text-color: ${theme.textColor};
      --font-family: '${theme.fontFamily}', sans-serif;
    }
    body {
      font-family: var(--font-family);
    }
  `;
}
