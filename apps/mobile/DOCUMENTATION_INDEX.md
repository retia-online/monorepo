# Documentación - Retia Mobile App

Índice completo de documentación para la app móvil.

## 📚 Documentación Principal

### Para Empezar
1. **[QUICKSTART.md](./QUICKSTART.md)** ⭐ **EMPIEZA AQUÍ**
   - Guía de 5 minutos
   - Setup básico
   - Primeros pasos

2. **[README.md](./README.md)**
   - Documentación completa
   - Todas las características
   - Troubleshooting

### Configuración
3. **[.env.example](./.env.example)**
   - Variables de entorno
   - Configuración requerida
   - Configuración opcional

4. **[DATABASE_CONNECTION.md](./DATABASE_CONNECTION.md)** ⭐ **IMPORTANTE**
   - Por qué la app móvil no conecta a BD
   - Arquitectura de conexiones
   - Flujos de datos
   - Seguridad en capas

5. **[OAUTH_SETUP.md](./OAUTH_SETUP.md)**
   - Configuración de Google OAuth
   - Configuración de Facebook OAuth
   - Troubleshooting de OAuth

### Arquitectura y Diseño
6. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - Diagrama de arquitectura
   - Componentes principales
   - Flujos de datos
   - Ciclo de vida

7. **[API_ENDPOINTS.md](./API_ENDPOINTS.md)**
   - Documentación de endpoints
   - Request/response formats
   - Códigos de error
   - Testing

### Progreso y Estado
8. **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)**
   - Estado actual (50% completado)
   - Tareas completadas
   - Tareas pendientes
   - Próximos pasos

9. **[PROGRESS_SUMMARY.md](./PROGRESS_SUMMARY.md)**
   - Resumen de progreso
   - Métricas
   - Timeline estimado

---

## 🎯 Guías por Caso de Uso

### Quiero empezar a desarrollar
1. Lee [QUICKSTART.md](./QUICKSTART.md) (5 min)
2. Sigue los pasos de instalación
3. Abre la app en simulador
4. Prueba login/registro

### Quiero entender la arquitectura
1. Lee [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Revisa los diagramas
3. Explora el código en `src/`
4. Lee [API_ENDPOINTS.md](./API_ENDPOINTS.md)

### Quiero entender cómo funciona la conexión a BD
1. Lee [DATABASE_CONNECTION.md](./DATABASE_CONNECTION.md)
2. Entiende la arquitectura
3. Revisa los flujos de datos
4. Comprende por qué es seguro

### Quiero configurar OAuth
1. Lee [OAUTH_SETUP.md](./OAUTH_SETUP.md)
2. Sigue los pasos para Google
3. Sigue los pasos para Facebook
4. Prueba los flujos en la app

### Tengo un problema
1. Revisa [README.md](./README.md) - Sección "Troubleshooting"
2. Revisa [QUICKSTART.md](./QUICKSTART.md) - Sección "Problemas Comunes"
3. Revisa [OAUTH_SETUP.md](./OAUTH_SETUP.md) - Sección "Troubleshooting"
4. Abre un issue

### Quiero ver el estado del proyecto
1. Lee [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
2. Lee [PROGRESS_SUMMARY.md](./PROGRESS_SUMMARY.md)
3. Revisa [.kiro/specs/mobile-auth-app/tasks.md](../../.kiro/specs/mobile-auth-app/tasks.md)

---

## 📊 Documentación por Tema

### Autenticación
- [README.md](./README.md) - Sección "Autenticación"
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Sección "Flujo de Autenticación"
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Endpoints de autenticación

### Seguridad
- [README.md](./README.md) - Sección "Seguridad"
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Sección "Seguridad"

### Desarrollo
- [QUICKSTART.md](./QUICKSTART.md) - Setup y primeros pasos
- [README.md](./README.md) - Sección "Estructura del Proyecto"
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Sección "Estructura de Carpetas"

### Deployment
- [README.md](./README.md) - Sección "Compilar para Producción"
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Sección "Producción"

### Testing
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Sección "Testing"
- [PROGRESS_SUMMARY.md](./PROGRESS_SUMMARY.md) - Sección "Remaining Tasks"

---

## 🔗 Enlaces Rápidos

### Archivos Importantes
- [src/App.tsx](./src/App.tsx) - Punto de entrada
- [src/context/AuthContext.tsx](./src/context/AuthContext.tsx) - Estado global
- [src/lib/api.ts](./src/lib/api.ts) - Cliente HTTP
- [src/lib/oauth.ts](./src/lib/oauth.ts) - OAuth flows
- [src/screens/LoginScreen.tsx](./src/screens/LoginScreen.tsx) - Login
- [src/screens/RegisterScreen.tsx](./src/screens/RegisterScreen.tsx) - Registro
- [src/screens/ProfileScreen.tsx](./src/screens/ProfileScreen.tsx) - Perfil

### Configuración
- [app.json](./app.json) - Configuración de Expo
- [package.json](./package.json) - Dependencias
- [tsconfig.json](./tsconfig.json) - TypeScript config
- [.env.example](./.env.example) - Variables de entorno

### Specs
- [../../.kiro/specs/mobile-auth-app/requirements.md](../../.kiro/specs/mobile-auth-app/requirements.md)
- [../../.kiro/specs/mobile-auth-app/design.md](../../.kiro/specs/mobile-auth-app/design.md)
- [../../.kiro/specs/mobile-auth-app/tasks.md](../../.kiro/specs/mobile-auth-app/tasks.md)

---

## 📱 Plataformas

### iOS
- Simulador: `yarn ios`
- Dispositivo: Expo Go
- Documentación: [README.md](./README.md) - Sección "iOS"

### Android
- Emulador: `yarn android`
- Dispositivo: Expo Go
- Documentación: [README.md](./README.md) - Sección "Android"

### Web
- Desarrollo: `yarn web`
- Documentación: [README.md](./README.md) - Sección "Web"

---

## 🚀 Comandos Útiles

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

---

## 📈 Estado del Proyecto

**Completado**: 50%
- ✅ Autenticación
- ✅ Pantallas
- ✅ Servicios
- ✅ Documentación

**Pendiente**: 50%
- ⏳ Tests
- ⏳ Backend OAuth
- ⏳ Producción

Ver [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) para detalles.

---

## 💡 Tips

1. **Empieza con QUICKSTART.md** - Es la forma más rápida de empezar
2. **Lee ARCHITECTURE.md** - Para entender cómo funciona todo
3. **Revisa el código** - Es la mejor documentación
4. **Usa los logs** - Revisa la terminal para debugging

---

## 🆘 Soporte

- **Problemas**: Revisa [README.md](./README.md) - Troubleshooting
- **Preguntas**: Abre un issue
- **Sugerencias**: Abre un PR

---

**Última actualización**: Diciembre 11, 2024
**Estado**: En Desarrollo (50% completado)
