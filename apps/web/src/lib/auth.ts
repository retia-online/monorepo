import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { connectDB, User, UserRole } from '@retia/database';
import { loginSchema } from '@retia/utils';
import { logger, logAuth } from './logger';

// Get enabled auth providers from environment
const getEnabledProviders = (): string[] => {
    const providers = process.env.AUTH_PROVIDERS || 'email';
    return providers.split(',').map((p) => p.trim().toLowerCase());
};

const enabledProviders = getEnabledProviders();

// Build providers array dynamically based on environment config
const providers: NextAuthConfig['providers'] = [];

// Credentials (Email/Password) - always include if 'email' is enabled
if (enabledProviders.includes('email')) {
    providers.push(
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    // Validate credentials
                    const validated = loginSchema.parse(credentials);

                    // Connect to database
                    await connectDB();

                    // Find user with password field
                    const user = await User.findOne({ email: validated.email }).select('+password');

                    if (!user || !user.password) {
                        logAuth.login(validated.email, false);
                        return null;
                    }

                    // Verify password
                    const isValid = await user.comparePassword(validated.password);

                    if (!isValid) {
                        logAuth.login(validated.email, false);
                        return null;
                    }

                    // Log successful login
                    logAuth.login(user.email, true);

                    // Return user object
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        image: user.image,
                    };
                } catch (error) {
                    logger.error({
                        event: 'auth.error',
                        error: error instanceof Error ? error.message : 'Unknown error',
                    }, 'Authorization error');
                    return null;
                }
            },
        })
    );
}

// Google OAuth
if (enabledProviders.includes('google') && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    );
}

// Facebook OAuth
if (enabledProviders.includes('facebook') && process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    providers.push(
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        })
    );
}

export const authConfig: NextAuthConfig = {
    providers,
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                await connectDB();

                // If OAuth login, check if user exists or create
                if (account?.provider !== 'credentials') {
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        // Check if this is the first user (should be admin)
                        const userCount = await User.countDocuments();
                        const isFirstUser = userCount === 0;

                        // Create new user from OAuth
                        const newUser = await User.create({
                            name: user.name || profile?.name || 'User',
                            email: user.email,
                            role: isFirstUser ? UserRole.ADMIN : UserRole.USER,
                            emailVerified: new Date(),
                            image: user.image || profile?.image,
                        });

                        user.id = newUser._id.toString();
                        user.role = newUser.role;
                    } else {
                        user.id = existingUser._id.toString();
                        user.role = existingUser.role;
                    }
                }

                return true;
            } catch (error) {
                console.error('SignIn callback error:', error);
                return false;
            }
        },
        async jwt({ token, user, trigger }) {
            // Add user info to token on sign in
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.name = user.name;
                token.email = user.email;
                token.picture = user.image;
            }

            // Refresh token data if needed
            if (trigger === 'update') {
                await connectDB();
                const dbUser = await User.findById(token.id);
                if (dbUser) {
                    token.role = dbUser.role;
                    token.name = dbUser.name;
                    token.email = dbUser.email;
                    token.picture = dbUser.image;
                }
            }

            return token;
        },
        async session({ session, token }) {
            // Add custom fields to session
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
