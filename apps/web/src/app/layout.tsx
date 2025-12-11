import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getThemeFromEnv } from '@/lib/theme';

const inter = Inter({ subsets: ['latin'] });

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

    return (
        <html lang="en">
            <head>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
              :root {
                --primary-color: ${theme.primaryColor};
                --secondary-color: ${theme.secondaryColor};
                --background-color: ${theme.backgroundColor};
                --text-color: ${theme.textColor};
              }
            `,
                    }}
                />
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
