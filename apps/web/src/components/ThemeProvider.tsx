'use client';

import { useEffect } from 'react';
import { getThemeStyles } from '@/hooks/useTheme';

interface ThemeProviderProps {
    children: React.ReactNode;
}

/**
 * Proveedor de tema que aplica las variables CSS personalizadas
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
    useEffect(() => {
        const styles = getThemeStyles();
        const root = document.documentElement;

        // Aplicar las variables CSS al root
        Object.entries(styles).forEach(([property, value]) => {
            root.style.setProperty(property, value as string);
        });

        // Aplicar la fuente al body
        document.body.style.fontFamily = (styles as any)['--font-family'] as string;
    }, []);

    return <>{children}</>;
}
