import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, UserRole } from '@core/api';
import { registerSchema, sendWelcomeEmail, sendPendingApprovalEmail } from '@core/api';
import { rateLimit } from '@/lib/rate-limit';
import { logger, logAuth, logAPI } from '@/lib/logger';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

export async function POST(request: NextRequest) {
    const ip =
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting
    const rateLimitResponse = await rateLimit(request, 'register');
    if (rateLimitResponse) {
        logAPI.rateLimited(ip, '/api/register');
        return rateLimitResponse;
    }

    try {
        const body = await request.json();
        const { token: invitationToken } = body;

        // Validate input
        const validated = registerSchema.parse(body);

        // Connect to database
        await connectDB();

        const authMode = process.env.AUTH_MODE || 'required';
        const userCount = await User.countDocuments();
        const isFirstUserAtStart = userCount === 0;

        // Find user by email (could be a pre-created invitation)
        const existingUser = await User.findOne({ email: validated.email }).select(
            '+inviteToken +inviteExpires'
        );

        let user;
        let isInvitedFlow = false;

        // Handle Invite-only mode or Invitation usage
        if (invitationToken) {
            if (!existingUser || existingUser.inviteToken !== invitationToken) {
                return NextResponse.json(
                    { error: 'Token de invitación inválido' },
                    { status: 400 }
                );
            }
            if (existingUser.inviteExpires && existingUser.inviteExpires < new Date()) {
                return NextResponse.json({ error: 'La invitación ha expirado' }, { status: 400 });
            }

            // Update the existing invited user
            existingUser.name = validated.name;
            existingUser.password = validated.password;
            existingUser.inviteToken = undefined;
            existingUser.inviteExpires = undefined;
            existingUser.approved = true; // Invited users are auto-approved
            user = await existingUser.save();
            isInvitedFlow = true;
        } else {
            // If it's invite-only mode and NO token was provided, reject
            if (authMode === 'invite-only') {
                return NextResponse.json(
                    { error: 'El registro solo está permitido mediante invitación' },
                    { status: 403 }
                );
            }

            // Standard registration checks
            if (existingUser) {
                logger.warn(
                    {
                        event: 'register.duplicate_email',
                        email: validated.email,
                        ip,
                    },
                    `Registration attempt with existing email: ${validated.email}`
                );

                return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 });
            }

            // Determine approval status for standard flow
            const needsApproval = authMode === 'whitelist' && !isFirstUserAtStart;

            // Create new user
            user = await User.create({
                name: validated.name,
                email: validated.email,
                password: validated.password,
                role: isFirstUserAtStart ? UserRole.ADMIN : UserRole.USER,
                approved: isFirstUserAtStart ? true : !needsApproval,
                metadata: {},
            });
        }

        // Log successful registration
        logAuth.register(user.email, user.role, ip);

        // Calculate if we need approval notification for the response
        // (Invited users NEVER need approval notification)
        const needsApprovalNotification =
            authMode === 'whitelist' && !isFirstUserAtStart && !isInvitedFlow;

        // Send welcome email (optional, catch errors to not block registration)
        try {
            if (needsApprovalNotification) {
                await sendPendingApprovalEmail(user.name, user.email);
            } else {
                await sendWelcomeEmail(user.name, user.email);
            }
        } catch (emailError) {
            logger.warn(
                {
                    event: 'email.send_failed',
                    email: user.email,
                    error: emailError instanceof Error ? emailError.message : 'Unknown error',
                },
                'Failed to send welcome email'
            );
        }

        const responseMessage = needsApprovalNotification
            ? 'Usuario registrado. Tu cuenta requiere aprobación del administrador antes de poder iniciar sesión.'
            : 'Usuario registrado exitosamente';

        // Generate JWT token if user is approved
        let jwtToken: string | undefined;
        if (user.approved) {
            jwtToken = await new SignJWT({
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('7d')
                .sign(JWT_SECRET);
        }

        return NextResponse.json(
            {
                message: responseMessage,
                needsApproval: needsApprovalNotification,
                token: jwtToken,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    approved: user.approved,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        logAPI.error(
            'POST',
            '/api/register',
            error instanceof Error ? error : new Error(String(error)),
            ip
        );

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 });
    }
}
