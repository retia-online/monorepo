
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Cargar variables de entorno desde .env.production explícitamente
// Asumimos que se ejecuta desde la raíz del monorepo
const envPath = path.resolve(process.cwd(), '.env.production');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('❌ Error cargando .env.production:', result.error);
    process.exit(1);
}

console.log('📄 Variables cargadas de:', envPath);
console.log('🔌 Intentando conectar a la base de datos de producción...');

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('❌ MONGODB_URI no está definido en .env.production');
    process.exit(1);
}

// Ocultar contraseña en logs
const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
console.log(`📡 URI: ${maskedUri}`);

async function testConnection() {
    try {
        await mongoose.connect(uri as string);
        console.log('✅ ¡Conexión exitosa a MongoDB Atlas!');

        // Obtener información adicional
        if (mongoose.connection.db) {
            const admin = mongoose.connection.db.admin();
            const serverInfo = await admin.serverInfo();
            console.log(`ℹ️  Versión de MongoDB: ${serverInfo.version}`);

            // Listar colecciones para verificar permisos de lectura
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log(`📚 Colecciones encontradas (${collections.length}):`);
            collections.forEach(col => console.log(`   - ${col.name}`));
        } else {
            console.log('⚠️ No se pudo acceder a mongoose.connection.db para obtener más detalles.');
        }

    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Conexión cerrada.');
    }
}

testConnection();
