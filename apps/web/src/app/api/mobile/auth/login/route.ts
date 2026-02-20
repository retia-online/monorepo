import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '@megamercado-vzla/api';
import { loginSchema } from '@megamercado-vzla/api';
import { rateLimit } from '@/lib/rate-limit';
import { logger, logAuth, logAPI } from '@/lib/logger';
import { generateMobileToken } from '@megamercado-vzla/auth';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret';

export async function POST(request: NextRequest) {
    const ip =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting
    const rateLimitResponse = await rateLimit(request, 'login');
    if (rateLimitResponse) {
        logAPI.rateLimited(ip, '/api/mobile/auth/login');
        return rateLimitResponse;
    }

    try {
        const body = await request.json();
        console.log('--- MOBILE LOGIN ATTEMPT ---');
        console.log('Body:', JSON.stringify({ ...body, password: '***' }));

        // Validate input
        const validated = loginSchema.parse(body);
        console.log('Validated Provider:', validated.provider);

        // Connect to database
        await connectDB();

        let user;

        if (validated.provider === 'odoo') {
            const { createOdooService } = await import('@megamercado-vzla/api');
            const odoo = createOdooService();
            const odooUser = await odoo.authenticate(validated.email, validated.password);

            if (!odooUser) {
                logAuth.login(validated.email, false);
                return NextResponse.json({ error: 'Credenciales de Odoo incorrectas' }, { status: 401 });
            }

            // Find or create local user linked to Odoo
            user = await User.findOne({ email: odooUser.email });

            if (!user) {
                user = await User.create({
                    name: odooUser.name,
                    email: odooUser.email,
                    role: odooUser.isAdmin ? 'ADMIN' : 'USER',
                    approved: true, // Auto-approved if coming from Odoo
                    metadata: {
                        odoo_uid: odooUser.uid,
                        odoo_company_id: odooUser.company_id,
                    }
                });
            } else {
                // Update role and metadata from Odoo
                user.role = odooUser.isAdmin ? 'ADMIN' : 'USER';
                user.metadata = {
                    ...user.metadata,
                    odoo_uid: odooUser.uid,
                    odoo_company_id: odooUser.company_id,
                };
                await user.save();
            }
        } else {
            // Standard Email/Password Login
            user = await User.findOne({ email: validated.email }).select('+password');

            if (!user || !user.password) {
                logAuth.login(validated.email, false);
                return NextResponse.json({ error: 'El email o la contraseña son incorrectos' }, { status: 401 });
            }

            // Verify password
            const isValid = await user.comparePassword(validated.password);

            if (!isValid) {
                logAuth.login(validated.email, false);
                return NextResponse.json({ error: 'El email o la contraseña son incorrectos' }, { status: 401 });
            }
        }

        // Check if user is approved (for whitelist mode)
        // ADMINs are always considered approved
        if (user.role !== 'ADMIN' && !user.approved) {
            logger.warn({
                event: 'auth.pending_approval',
                email: user.email,
            }, 'User login attempt (mobile) - pending approval');
            logAuth.login(validated.email, false);
            return NextResponse.json({ error: 'Tu cuenta está pendiente de aprobación' }, { status: 403 });
        }

        // Log successful login
        logAuth.login(user.email, true);

        // Create JWT token for mobile using SDK
        const token = await generateMobileToken(
            {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
            },
            JWT_SECRET
        );

        return NextResponse.json({
            message: 'Login exitoso',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
            },
            token,
        });
    } catch (error: any) {
        logAPI.error(
            'POST',
            '/api/mobile/auth/login',
            error instanceof Error ? error : new Error(String(error)),
            ip
        );

        if (error?.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
    }
}
