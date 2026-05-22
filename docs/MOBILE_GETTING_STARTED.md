# Getting Started with Monorepo Mobile App

Guía para empezar con la app móvil Monorepo.

## 🚀 Quick Start (5 minutos)

```bash
# 1. Navega a la app móvil
cd apps/mobile

# 2. Instala dependencias
yarn install

# 3. Copia el archivo de configuración
cp .env.example .env.development

# 4. Inicia el servidor
yarn start

# 5. Abre en simulador
yarn ios    # Para iOS
yarn android # Para Android
```

¡Listo! La app debería estar corriendo.

## 📱 Plataformas Soportadas

- **iOS** - Simulador o dispositivo
- **Android** - Emulador o dispositivo
- **Web** - Para testing (experiencia limitada)

## 🔧 Configuración

### Variables de Entorno

Edita `apps/mobile/.env.development`:

```bash
# Backend API (requerido)
EXPO_PUBLIC_API_URL=http://localhost:3000

# OAuth (opcional)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
EXPO_PUBLIC_FACEBOOK_APP_ID=your-app-id

# Tema (opcional)
EXPO_PUBLIC_PRIMARY_COLOR=#3b82f6
EXPO_PUBLIC_SECONDARY_COLOR=#10b981
```

### Backend

Asegúrate de que el backend esté corriendo:

```bash
# En otra terminal
yarn workspace @monorepo/web dev
```

## 📚 Documentación

- **[QUICKSTART.md](../apps/mobile/QUICKSTART.md)** - Guía rápida (5 min)
- **[README.md](../apps/mobile/README.md)** - Documentación completa
- **Documentación adicional**: Ver [docs/backup/mobile/](../backup/mobile/) para archivos específicos de arquitectura, OAuth y API

## 🧪 Flujos de Prueba

### Registro
1. Toca "Regístrate aquí"
2. Ingresa nombre, email y contraseña
3. Toca "Registrarse"

### Login
1. Ingresa email y contraseña
2. Toca "Iniciar Sesión"

### Logout
1. En la pantalla de perfil
2. Toca "Cerrar Sesión"

## 🐛 Troubleshooting

### "Cannot connect to API"
```bash
# Verifica que el backend esté corriendo
curl http://localhost:3000

# En dispositivo físico, usa tu IP local
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

### "Module not found"
```bash
# Reinstala dependencias
rm -rf node_modules && yarn install
```

### "Simulador no inicia"
```bash
# Limpia caché
yarn start --clear
```

## 📊 Estructura del Proyecto

```
apps/mobile/
├── src/
│   ├── screens/          # UI components
│   ├── context/          # State management
│   ├── lib/              # Services
│   ├── navigation/       # Navigation
│   └── types/            # TypeScript types
├── app.json              # Expo config
├── package.json
└── README.md
```

## 🔗 Comandos Útiles

```bash
# Desarrollo
yarn start              # Inicia servidor
yarn ios               # Abre en iOS
yarn android           # Abre en Android
yarn web               # Abre en web

# Calidad
yarn lint              # Linting
yarn type-check        # Type checking

# Limpiar
yarn start --clear     # Limpia caché
```

## 🎯 Estado Actual

- ✅ Autenticación email/password
- ✅ Registro de usuarios
- ✅ OAuth (Google & Facebook)
- ✅ Perfil de usuario
- ✅ Almacenamiento seguro
- ⏳ Tests (en progreso)
- ⏳ Producción (próximamente)

## 📞 Soporte

- Revisa la [documentación completa](../apps/mobile/README.md)
- Consulta [QUICKSTART.md](../apps/mobile/QUICKSTART.md)
- Abre un issue en el repositorio

---

**Última actualización**: Diciembre 11, 2024
