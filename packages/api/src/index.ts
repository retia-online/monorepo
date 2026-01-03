// Database connection
export { connectDB, default as connect } from './connection';

// Models
export { default as User, UserRole, type IUser } from './models/User';
export { default as Account, type IAccount } from './models/Account';
export { default as Session, type ISession } from './models/Session';

// User services
export {
    getUserBackup,
    createUser,
    updateUser,
    findUserByEmail,
    findUserById,
    getAllUsers,
    deleteUser,
    type UserBackupData,
} from './services/user';

// Email services
export {
    sendEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendPendingApprovalEmail,
} from './services/email';

// Crypto utilities
export {
    hashPassword,
    comparePassword,
    generateToken,
    generatePasswordResetToken,
    generateInviteToken,
} from './utils/crypto';

// Validation utilities
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