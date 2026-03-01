'use client';

import { useMemo } from 'react';

/**
 * Hook para acceder a los colores del tema desde las variables de entorno
 */
export function useTheme() {
    const theme = useMemo(() => {
        const withHash = (c?: string, d = '') => (c ? (c.startsWith('#') ? c : `#${c}`) : d);
        return {
            colors: {
                primary: withHash(process.env.NEXT_PUBLIC_PRIMARY_COLOR, '#6366f1'),
                secondary: withHash(process.env.NEXT_PUBLIC_SECONDARY_COLOR, '#ec4899'),
                background: withHash(process.env.NEXT_PUBLIC_BACKGROUND_COLOR, '#f8fafc'),
                text: withHash(process.env.NEXT_PUBLIC_TEXT_COLOR, '#1e293b'),
            },
            font: {
                family: process.env.NEXT_PUBLIC_FONT_FAMILY || 'Manrope',
            },
        };
    }, []);

    return theme;
}

/**
 * Función para generar estilos CSS dinámicos
 */
export function getThemeStyles() {
    const withHash = (c?: string, d = '') => (c ? (c.startsWith('#') ? c : `#${c}`) : d);
    const primaryColor = withHash(process.env.NEXT_PUBLIC_PRIMARY_COLOR, '#6366f1');
    const secondaryColor = withHash(process.env.NEXT_PUBLIC_SECONDARY_COLOR, '#ec4899');
    const backgroundColor = withHash(process.env.NEXT_PUBLIC_BACKGROUND_COLOR, '#f8fafc');
    const textColor = withHash(process.env.NEXT_PUBLIC_TEXT_COLOR, '#1e293b');
    const fontFamily = process.env.NEXT_PUBLIC_FONT_FAMILY || 'Manrope';

    return {
        '--color-primary': primaryColor,
        '--color-secondary': secondaryColor,
        '--color-background': backgroundColor,
        '--color-text': textColor,
        '--font-family': fontFamily,
    } as React.CSSProperties;
}
