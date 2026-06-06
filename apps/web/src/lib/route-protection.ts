// Import route protection functions from @core/auth SDK
export {
    requireAuth,
    redirectIfAuthenticated,
    requireAdmin,
    checkFirstUser,
} from '@core/auth';
