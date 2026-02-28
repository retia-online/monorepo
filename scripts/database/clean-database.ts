#!/usr/bin/env ts-node

/**
 * Script para limpiar completamente la base de datos
 * 
 * Uso:
 *   yarn clean-db
 *   npm run clean-db
 *   npx ts-node scripts/database/clean-database.ts
 * 
 * ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

/**
 * Conectar a MongoDB usando la configuración del .env.development
 */
async function connectToMongoDB() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI no está definido en .env.development');
  }

  await mongoose.connect(mongoUri);
  return mongoose.connection.db;
}

interface CleanOptions {
  force?: boolean;
  collections?: string[];
  confirm?: boolean;
}

/**
 * Limpiar todas las colecciones de la base de datos
 */
async function cleanDatabase(options: CleanOptions = {}) {
  try {
    console.log('🔌 Conectando a MongoDB...');
    
    // Conectar a la base de datos
    const db = await connectToMongoDB();
    if (!db) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    console.log(`📊 Base de datos: ${db.databaseName}`);
    console.log(`🔗 URI: ${process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@')}`);

    // Obtener lista de colecciones
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('✅ La base de datos ya está vacía');
      return;
    }

    console.log(`\n📋 Colecciones encontradas (${collections.length}):`);
    collections.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.name}`);
    });

    // Confirmar si no está en modo force
    if (!options.force && !options.confirm) {
      console.log('\n⚠️  ADVERTENCIA: Esta operación eliminará TODOS los datos');
      console.log('   Para confirmar, ejecuta:');
      console.log('   yarn clean-db --force');
      console.log('   o');
      console.log('   yarn clean-db --confirm');
      return;
    }

    console.log('\n🗑️  Eliminando colecciones...');

    // Eliminar colecciones específicas o todas
    const collectionsToDelete = options.collections || collections.map(c => c.name);
    
    for (const collectionName of collectionsToDelete) {
      try {
        await db.collection(collectionName).drop();
        console.log(`  ✅ ${collectionName} eliminada`);
      } catch (error: any) {
        if (error.code === 26) {
          console.log(`  ⚠️  ${collectionName} no existe`);
        } else {
          console.log(`  ❌ Error eliminando ${collectionName}: ${error.message}`);
        }
      }
    }

    // Verificar que se eliminaron
    const remainingCollections = await db.listCollections().toArray();
    
    if (remainingCollections.length === 0) {
      console.log('\n✅ Base de datos limpiada exitosamente');
      console.log('   Todas las colecciones han sido eliminadas');
    } else {
      console.log(`\n⚠️  Quedan ${remainingCollections.length} colecciones:`);
      remainingCollections.forEach(col => {
        console.log(`  - ${col.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

/**
 * Limpiar colecciones específicas
 */
async function cleanSpecificCollections(collectionNames: string[]) {
  return cleanDatabase({ 
    collections: collectionNames,
    confirm: true 
  });
}

/**
 * Mostrar estadísticas de la base de datos
 */
async function showDatabaseStats() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    const db = await connectToMongoDB();
    if (!db) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    console.log(`\n📊 Estadísticas de la base de datos: ${db.databaseName}`);
    console.log(`🔗 URI: ${process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@')}`);

    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('📋 No hay colecciones en la base de datos');
      return;
    }

    console.log(`\n📋 Colecciones (${collections.length}):`);
    
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  📄 ${collection.name}: ${count} documentos`);
      } catch (error) {
        console.log(`  ❌ ${collection.name}: Error obteniendo conteo`);
      }
    }

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Procesar argumentos de línea de comandos
function parseArgs() {
  const args = process.argv.slice(2);
  const options: CleanOptions & { stats?: boolean; help?: boolean } = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--force':
      case '-f':
        options.force = true;
        break;
      case '--confirm':
      case '-c':
        options.confirm = true;
        break;
      case '--stats':
      case '-s':
        options.stats = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--collections':
        // Siguiente argumento debe ser lista de colecciones
        if (i + 1 < args.length) {
          options.collections = args[i + 1].split(',');
          i++; // Saltar el siguiente argumento
        }
        break;
    }
  }
  
  return options;
}

// Mostrar ayuda
function showHelp() {
  console.log(`
🗑️  Script de Limpieza de Base de Datos

Uso:
  yarn clean-db [opciones]
  npx ts-node scripts/database/clean-database.ts [opciones]

Opciones:
  --force, -f              Limpiar sin confirmación
  --confirm, -c            Confirmar limpieza (alternativa a --force)
  --stats, -s              Mostrar estadísticas de la base de datos
  --collections <lista>    Limpiar solo colecciones específicas (separadas por coma)
  --help, -h               Mostrar esta ayuda

Ejemplos:
  yarn clean-db --stats                    # Ver estadísticas
  yarn clean-db --force                    # Limpiar todo
  yarn clean-db --collections users,posts # Limpiar solo users y posts

⚠️  ADVERTENCIA: La limpieza eliminará TODOS los datos de las colecciones especificadas
`);
}

// Función principal
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }
  
  if (options.stats) {
    await showDatabaseStats();
    return;
  }
  
  // Verificar que existe MONGODB_URI
  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI no está definido en .env.development');
    console.log('   Asegúrate de tener un archivo .env.development con:');
    console.log('   MONGODB_URI=mongodb://127.0.0.1:27017/monorepo');
    process.exit(1);
  }
  
  await cleanDatabase(options);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

// Exportar funciones para uso programático
export {
  cleanDatabase,
  cleanSpecificCollections,
  showDatabaseStats
};