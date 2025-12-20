#!/usr/bin/env node

/**
 * Script para sincronizar assets compartidos a las aplicaciones
 * 
 * Uso:
 *   node scripts/sync-assets.js
 *   yarn sync-assets
 */

const fs = require('fs');
const path = require('path');

const ASSETS_SOURCE = path.join(__dirname, '../assets');
const WEB_PUBLIC = path.join(__dirname, '../apps/web/public/assets');

/**
 * Copia recursivamente una carpeta
 */
function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }

    const files = fs.readdirSync(from);
    
    for (const file of files) {
        const fromPath = path.join(from, file);
        const toPath = path.join(to, file);
        
        if (fs.statSync(fromPath).isDirectory()) {
            copyFolderSync(fromPath, toPath);
        } else {
            fs.copyFileSync(fromPath, toPath);
            console.log(`✅ Copiado: ${file}`);
        }
    }
}

/**
 * Función principal
 */
function syncAssets() {
    console.log('🔄 Sincronizando assets...');
    
    try {
        // Copiar assets a la aplicación web
        copyFolderSync(ASSETS_SOURCE, WEB_PUBLIC);
        
        console.log('');
        console.log('✅ Assets sincronizados exitosamente');
        console.log(`📁 Origen: ${ASSETS_SOURCE}`);
        console.log(`📁 Destino: ${WEB_PUBLIC}`);
        
    } catch (error) {
        console.error('❌ Error sincronizando assets:', error.message);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    syncAssets();
}

module.exports = { syncAssets };