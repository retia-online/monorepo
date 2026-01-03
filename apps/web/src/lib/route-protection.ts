// Import route protection functions from @megamercado/auth SDK
export { 
  requireAuth, 
  redirectIfAuthenticated, 
  requireAdmin, 
  checkFirstUser 
} from '@megamercado/auth';
