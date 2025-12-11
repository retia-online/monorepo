# 🚀 Inicio Rápido - 5 Minutos

Sigue estos pasos para tener el sistema corriendo localmente en menos de 5 minutos.

## Paso 1: Instalar Dependencias (1 min)

```bash
cd /Users/lo/Code/retia/monorepo
yarn install
```

## Paso 2: Configurar Variables de Entorno (1 min)

Ya existe un archivo `.env.local` con valores básicos. Si quieres personalizarlo:

```bash
# Opcional: editar configuración
nano .env.local

# Mínimo requerido:
# - MONGODB_URI (si tienes MongoDB local, ya está configurado)
# - NEXTAUTH_SECRET (genera uno con: openssl rand -base64 32)
```

**MongoDB Local**: Si no tienes MongoDB instalado, puedes usar MongoDB Atlas (gratis) o instalarlo:

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu/Debian)
# Ver instrucciones en docs/LOCAL_SETUP.md
```

## Paso 3: Generar Secret (30 seg)

```bash
# Genera un secret aleatorio
openssl rand -base64 32

# Copia el resultado y pégalo en .env.local como NEXTAUTH_SECRET
```

## Paso 4: Iniciar el Servidor (30 seg)

```bash
yarn dev
```

El servidor arrancará en: **http://localhost:3000**

## Paso 5: Primer Uso (1 min)

1. **Abre tu navegador**: http://localhost:3000
2. **Serás redirigido a** `/register`
3. **Completa el formulario** de registro
4. **¡Listo!** Tu primer usuario es automáticamente **ADMINISTRADOR**

---

## 🎨 Personaliza los Colores (Opcional)

Edita `.env.local`:

```bash
PRIMARY_COLOR=#6366f1        # Color principal
SECONDARY_COLOR=#ec4899      # Color secundario
```

Reinicia el servidor (`Ctrl+C` y `yarn dev`) para ver los cambios.

---

## 📧 Configurar Email (Opcional - para recuperación de contraseña)

### Opción Fácil: Mailtrap (Gratis, ideal para desarrollo)

1. Crea cuenta en [mailtrap.io](https://mailtrap.io)
2. Copia las credenciales SMTP
3. Pégalas en `.env.local`:

```bash
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu-mailtrap-user
SMTP_PASSWORD=tu-mailtrap-password
```

### Opción Gmail

Ver instrucciones en [docs/LOCAL_SETUP.md](file:///Users/lo/Code/retia/monorepo/docs/LOCAL_SETUP.md)

---

## 🔐 Configurar OAuth (Opcional - Google/Facebook)

Solo necesario si quieres login con Google o Facebook.

Ver guía completa en [docs/LOCAL_SETUP.md](file:///Users/lo/Code/retia/monorepo/docs/LOCAL_SETUP.md)

Por ahora, puedes deshabilitarlos en `.env.local`:

```bash
AUTH_PROVIDERS=email
```

---

## ✅ ¡Todo Listo!

Tu sistema de autenticación está funcionando. Ahora puedes:

- 📖 Leer el [README.md](file:///Users/lo/Code/retia/monorepo/README.md) completo
- 🛠️ Ver [docs/LOCAL_SETUP.md](file:///Users/lo/Code/retia/monorepo/docs/LOCAL_SETUP.md) para desarrollo
- 🚀 Desplegar en Vercel con [docs/DEPLOYMENT.md](file:///Users/lo/Code/retia/monorepo/docs/DEPLOYMENT.md)

---

## 🆘 ¿Problemas?

### MongoDB no conecta

```bash
# Verifica que esté corriendo
brew services list | grep mongodb

# Si no está, inícialo
brew services start mongodb-community
```

### Puerto 3000 en uso

```bash
# Usa otro puerto
PORT=3001 yarn dev
```

### Dependencias no se instalan

```bash
# Reinstala todo
yarn clean
rm -rf yarn.lock
yarn install
```

Para más ayuda, revisa [docs/LOCAL_SETUP.md](file:///Users/lo/Code/retia/monorepo/docs/LOCAL_SETUP.md) sección "Troubleshooting".
