import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, UserRole } from '@retia/database';
import { registerSchema } from '@retia/utils';
import { sendWelcomeEmail } from '@retia/utils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validated = registerSchema.parse(body);

        // Connect to database
        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email: validated.email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email ya registrado' },
                { status: 400 }
            );
        }

        // Check if this is the first user
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;

        // Create new user
        const user = await User.create({
            name: validated.name,
            email: validated.email,
            password: validated.password,
            role: isFirstUser ? UserRole.ADMIN : UserRole.USER,
        });

        // Send welcome email (optional, catch errors to not block registration)
        try {
            await sendWelcomeEmail(user.name, user.email);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Continue anyway
        }

        return NextResponse.json(
            {
                message: 'Usuario registrado exitosamente',
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error al registrar usuario' },
            { status: 500 }
        );
    }
}
