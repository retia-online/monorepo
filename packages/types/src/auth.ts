export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    emailVerified?: Date;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Session {
    user: User;
    expires: string;
}

export interface AuthProvider {
    id: string;
    name: string;
    type: 'oauth' | 'credentials';
    enabled: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface ResetPasswordData {
    email: string;
}

export interface UpdatePasswordData {
    token: string;
    password: string;
}
