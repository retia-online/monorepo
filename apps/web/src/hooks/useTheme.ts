'use client';

import { useMemo } from 'react';

/**
 * Hook para acceder a los colores del tema desde las variables de entorno
 */
export function useTheme() {
    const theme = useMemo(() => {
        return {
            colors: {
                primary: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#6366f1',
                secondary: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#ec4899',
                background: process.env.NEXT_PUBLIC_BACKGROUND_COLOR || '#f8fafc',
                text: process.env.NEXT_PUBLIC_TEXT_COLOR || '#1e293b',
            },
            font: {
                family: process.env.NEXT_PUBLIC_FONT_FAMILY || 'Manrope',
            }
        };
    }, []);

    return theme;
}

/**
 * Función para generar estilos CSS dinámicos
 */
export function getThemeStyles() {
    const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#6366f1';
    const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#ec4899';
    const backgroundColor = process.env.NEXT_PUBLIC_BACKGROUND_COLOR || '#f8fafc';
    const textColor = process.env.NEXT_PUBLIC_TEXT_COLOR || '#1e293b';
    const fontFamily = process.env.NEXT_PUBLIC_FONT_FAMILY || 'Manrope';

    return {
        '--color-primary': primaryColor,
        '--color-secondary': secondaryColor,
        '--color-background': backgroundColor,
        '--color-text': textColor,
        '--font-family': fontFamily,
    } as React.CSSProperties;
}