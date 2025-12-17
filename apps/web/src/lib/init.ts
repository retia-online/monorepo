/**
 * Application initialization
 * This file should be imported at the very beginning of the application
 * to ensure environment variables are validated before anything else runs
 */

import { validateEnv } from './env';
import { logger } from './logger';

/**
 * Initialize the application
 * Validates environment variables and performs other startup checks
 */
export function initializeApp() {
    try {
        // Validate environment variables
        const env = validateEnv();

        logger.info(
            {
                event: 'app.initialized',
                nodeEnv: env.NODE_ENV,
                authProviders: env.AUTH_PROVIDERS,
            },
            'Application initialized successfully'
        );

        return env;
    } catch (error) {
        logger.fatal(
            {
                event: 'app.initialization_failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            'Failed to initialize application'
        );

        throw error;
    }
}
