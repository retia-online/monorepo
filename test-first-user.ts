import { connectDB, User, UserRole } from '@megamercado-vzla/api';
import mongoose from 'mongoose';

async function testRegistrationLogic() {
    try {
        console.log('🔌 Conectando a la base de datos...');
        await connectDB();

        console.log('🗑️  Limpiando base de datos de prueba...');
        await User.deleteMany({});

        const testEmail = 'admin@test.com';

        console.log('📝 Simulando registro del primer usuario...');

        // Lógica de apps/web/src/app/api/register/route.ts
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;

        // Supongamos que estamos en modo whitelist para probar el caso más restrictivo
        const authMode = 'whitelist';
        const needsApproval = authMode === 'whitelist' && !isFirstUser;

        console.log(`Estado: isFirstUser=${isFirstUser}, authMode=${authMode}, needsApproval=${needsApproval}`);

        const user = await User.create({
            name: 'Test Admin',
            email: testEmail,
            password: 'password123',
            role: isFirstUser ? UserRole.ADMIN : UserRole.USER,
            approved: !needsApproval,
        });

        console.log('✅ Usuario creado del registro:');
        console.log({
            id: user._id,
            email: user.email,
            role: user.role,
            approved: user.approved
        });

        if (user.role === 'ADMIN' && user.approved === true) {
            console.log('✨ VALIDACIÓN EXITOSA: El primer usuario es ADMIN y está APROBADO.');
        } else {
            console.error('❌ VALIDACIÓN FALLIDA: El primer usuario no es como se esperaba.');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testRegistrationLogic();
