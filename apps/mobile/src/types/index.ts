export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    image?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
    provider?: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
}

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
    login: (_credentials: LoginCredentials) => Promise<void>;
    register: (_credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}
