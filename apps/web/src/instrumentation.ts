/**
 * Next.js Instrumentation
 * This file is automatically loaded by Next.js before the application starts
 * Perfect place to validate environment variables and perform startup checks
 */

export async function register() {
    console.log('🚀 Application starting...');

    // Temporarily disabled due to thread-stream issues
    // Only run on server
    // if (process.env.NEXT_RUNTIME === 'nodejs') {
    //     const { initializeApp } = await import('./lib/init');
    //     initializeApp();
    // }
}
