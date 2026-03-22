import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, UserRole } from '@retia-global/api';
import { SignJWT } from 'jose';
import { logAuth, logAPI } from '@/lib/logger';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

export async function POST(request: NextRequest) {
    const ip =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    try {
        const body = await request.json();
        const { provider, userInfo } = body;

        if (!provider || !userInfo || !userInfo.email) {
            return NextResponse.json({ error: 'Datos de OAuth inválidos' }, { status: 400 });
        }

        // Connect to database
        await connectDB();

        // Check if user exists
        let user = await User.findOne({ email: userInfo.email });

        if (!user) {
            // Check if this is the first user (should be admin)
            const userCount = await User.countDocuments();
            const isFirstUser = userCount === 0;

            // Create new user from OAuth
            user = await User.create({
                name: userInfo.name || userInfo.email.split('@')[0],
                email: userInfo.email,
                role: isFirstUser ? UserRole.ADMIN : UserRole.USER,
                emailVerified: new Date(),
                image: userInfo.picture || userInfo.avatar_url,
            });

            logAuth.register(user.email, user.role, ip);
        } else {
            // Update user info if needed
            if (userInfo.name && user.name !== userInfo.name) {
                user.name = userInfo.name;
            }
            if (userInfo.picture && user.image !== userInfo.picture) {
                user.image = userInfo.picture;
            }
            await user.save();
        }

        // Log successful login
        logAuth.login(user.email, true);

        // Create JWT token for mobile
        const token = await new SignJWT({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        return NextResponse.json({
            message: 'Login OAuth exitoso',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
            },
            token,
        });
    } catch (error: unknown) {
        logAPI.error(
            'POST',
            '/api/mobile/auth/oauth',
            error instanceof Error ? error : new Error(String(error)),
            ip
        );

        return NextResponse.json({ error: 'Error en autenticación OAuth' }, { status: 500 });
    }
}
