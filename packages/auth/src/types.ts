import { Session, User } from 'next-auth';

export interface AuthUser extends User {
  id: string;
  role: string;
  name: string;
  email: string;
  image?: string;
}

export interface AuthSession extends Session {
  user: AuthUser;
}

export interface AuthCallbacks {
  signIn?: (params: { user: any; account: any; profile?: any }) => Promise<boolean>;
  jwt?: (params: { token: any; user?: any; trigger?: string }) => Promise<any>;
  session?: (params: { session: any; token: any }) => Promise<any>;
}

export interface AuthProviderConfig {
  email?: boolean;
  google?: boolean;
  facebook?: boolean;
}