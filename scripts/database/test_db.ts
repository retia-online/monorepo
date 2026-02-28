import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

// Función auxiliar para probar una conexión
async function testConnectionStep(name: string, uri: string) {
    console.log(`\n---------------------------------------------------`);
    console.log(`🧪 Probando conexión: ${name}`);

    // Ocultar contraseña en logs
    const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log(`📡 URI: ${maskedUri}`);

    try {
        await mongoose.connect(uri);
        console.log(`✅ ¡Conexión exitosa a ${name}!`);

        if (mongoose.connection.db) {
            const admin = mongoose.connection.db.admin();
            const serverInfo = await admin.serverInfo();
            console.log(`ℹ️  Versión de MongoDB: ${serverInfo.version}`);

            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log(`📚 Colecciones encontradas (${collections.length}):`);
            collections.forEach((col) => console.log(`   - ${col.name}`));
        }
    } catch (error) {
        console.error(`❌ Error conectando a ${name}:`, error);
    } finally {
        await mongoose.disconnect();
        console.log(`👋 Conexión cerrada para ${name}.`);
    }
}

async function runTests() {
    const rootDir = process.cwd();

    // 1. Probar Producción (.env.production o env.production)
    let prodEnvPath = path.resolve(rootDir, '.env.production');
    if (!fs.existsSync(prodEnvPath)) {
        // Fallback: intentar sin el punto
        const altPath = path.resolve(rootDir, 'env.production');
        if (fs.existsSync(altPath)) {
            console.log('⚠️ .env.production no encontrado, usando env.production');
            prodEnvPath = altPath;
        }
    }

    if (fs.existsSync(prodEnvPath)) {
        const prodConfig = dotenv.parse(fs.readFileSync(prodEnvPath));
        if (prodConfig.MONGODB_URI) {
            await testConnectionStep('PRODUCCIÓN (MongoDB Atlas)', prodConfig.MONGODB_URI);
        } else {
            console.log(`⚠️ ${path.basename(prodEnvPath)} encontrado pero falta MONGODB_URI`);
        }
    } else {
        console.log('⚠️ No se encontró .env.production ni env.production');
    }

    // 2. Probar Local (.env.development)
    const localEnvPath = path.resolve(rootDir, '.env.development');
    if (fs.existsSync(localEnvPath)) {
        const localConfig = dotenv.parse(fs.readFileSync(localEnvPath));
        if (localConfig.MONGODB_URI) {
            await testConnectionStep('LOCAL', localConfig.MONGODB_URI);
        } else {
            console.log('⚠️ .env.development encontrado pero falta MONGODB_URI');
        }
    } else {
        console.log('⚠️ No se encontró .env.development');
    }
}

runTests();
