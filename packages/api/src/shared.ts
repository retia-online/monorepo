// Environment-agnostic exports for use in both frontend (mobile/web) and backend
export {
    emailSchema,
    passwordSchema,
    nameSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
    updatePasswordSchema,
    validateEmail,
    validatePassword,
    validateName,
    getPasswordRequirements,
} from './utils/validation';

// You can add other shared types or constants here 
// that do not depend on Node.js built-ins.
