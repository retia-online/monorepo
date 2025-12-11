import type { Metadata } from 'next';
import './globals.css';
import { getThemeFromEnv, generateThemeCSS } from '@/lib/theme';

export const metadata: Metadata = {
    title: 'Auth System',
    description: 'Authentication system with Next.js and MongoDB',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const theme = getThemeFromEnv();
    const themeCSS = generateThemeCSS(theme);
    const fontUrl = `https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;

    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href={fontUrl} rel="stylesheet" />
                <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
            </head>
            <body>{children}</body>
        </html>
    );
}
