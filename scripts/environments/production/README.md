# Production Environment

## 📋 Descripción
Entorno de producción para usuarios finales. Este entorno maneja tráfico real y datos de producción.

## 🏗️ Estructura

```
scripts/environments/production/
├── README.md                    # Esta documentación
├── setup.sh                     # Script de configuración inicial
├── deploy.sh                    # Script de deploy a producción
├── mobile/                      # Configuración móvil
│   ├── setup.sh                 # Configurar mobile para producción
│   └── README.md               # Documentación móvil
├── web/                         # Configuración web
│   ├── setup.sh                 # Configurar web para producción
│   └── README.md               # Documentación web
├── database/                    # Configuración base de datos
│   ├── setup-mongodb.sh        # Configurar MongoDB Atlas para producción
│   └── README.md               # Documentación MongoDB
├── oauth/                       # Configuración OAuth
│   ├── setup-google.sh         # Configurar Google OAuth para producción
│   ├── setup-facebook.sh       # Configurar Facebook OAuth para producción
│   └── README.md               # Documentación OAuth
└── templates/                   # Plantillas
    ├── .env.web.production     # Plantilla variables web
    ├── .env.mobile.production  # Plantilla variables móvil
    └── vercel-production.json  # Plantilla configuración Vercel
```

## 🚀 Inicio Rápido

### 1. Configuración inicial
```bash
# Desde la raíz del proyecto
./scripts/environments/production/setup.sh
```

### 2. Configurar web app
```bash
./scripts/environments/production/web/setup.sh
```

### 3. Desplegar a producción
```bash
./scripts/environments/production/deploy.sh
```

### 4. Configurar mobile app
```bash
./scripts/environments/production/mobile/setup.sh
```

### 5. Generar builds de producción
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## 🔧 Requisitos Previos

### 1. **Dominio personalizado**
- Registrado en Google Domains, Namecheap, etc.
- Configurado en Vercel Dashboard → Domains

### 2. **Cuentas de servicio:**
- **Vercel Pro** (recomendado para producción)
- **MongoDB Atlas** (M10 o superior)
- **SendGrid/Mailgun** para emails
- **Google Cloud Console** (OAuth producción)
- **Facebook Developers** (OAuth producción)
- **Expo** (para builds móviles)

### 3. **Presupuesto estimado:**
- **Vercel Pro**: $20/mes
- **MongoDB Atlas M10**: $57/mes
- **SendGrid Essentials**: $19.95/mes
- **Dominio**: ~$15/año
- **Total inicial**: ~$97/mes

## 📊 Arquitectura de Producción

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dispositivo   │    │     Vercel       │    │   MongoDB Atlas │
│      Móvil      │◄──►│   (Producción)  │◄──►│    (M10+)       │
│   (Play Store/  │    │  Next.js API     │    │                 │
│   App Store)    │    │  Global CDN      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   APK/IPA signed        https://[dominio].com    Cluster M10+
   Auto-updates          SSL/TLS automático       Backup automático
```

## 🔗 URLs de Producción

### Web App:
- **Dominio principal**: `https://[tu-dominio].com`
- **API**: `https://[tu-dominio].com/api/...`
- **Health check**: `https://[tu-dominio].com/api/health`

### Mobile App:
- **Play Store**: `https://play.google.com/store/apps/details?id=com.retia.app`
- **App Store**: `https://apps.apple.com/app/retia/id[app-id]`
- **Expo Builds**: `https://expo.dev/accounts/[user]/projects/[project]`

### Servicios:
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **MongoDB Atlas**: `https://cloud.mongodb.com/v2/[project-id]`
- **SendGrid Dashboard**: `https://app.sendgrid.com`
- **Google Cloud Console**: `https://console.cloud.google.com`

## 🧪 Pruebas de Producción

### Pruebas pre-deploy:
1. **Testing en staging** completo
2. **Performance testing** (Lighthouse, WebPageTest)
3. **Security scanning** (OWASP ZAP, Snyk)
4. **Compliance checking** (GDPR, accessibility)

### Pruebas post-deploy:
1. **Smoke testing** de funcionalidades críticas
2. **User acceptance testing** (UAT)
3. **Monitoring setup** verificación
4. **Backup verification**

### Pruebas continuas:
1. **Uptime monitoring** (24/7)
2. **Performance monitoring** (Core Web Vitals)
3. **Error tracking** (Sentry, Vercel Analytics)
4. **Security monitoring** (log analysis, intrusion detection)

## ⚠️ Consideraciones de Producción

### 1. **Seguridad:**
- HTTPS obligatorio
- HSTS headers configurados
- CSP (Content Security Policy) implementado
- Rate limiting en endpoints
- Validación de input en frontend/backend
- Tokens JWT con expiración corta

### 2. **Escalabilidad:**
- Vercel Pro para mayor bandwidth
- MongoDB Atlas M10+ para más recursos
- CDN global automático (Vercel)
- Caching estratégico

### 3. **Disponibilidad:**
- Uptime > 99.9%
- Backup automático diario
- Plan de recovery documentado
- Monitoreo 24/7

### 4. **Cumplimiento:**
- GDPR compliance (si aplica)
- Accessibility (WCAG 2.1 AA)
- Privacy policy y términos de servicio
- Cookie consent

## 🔄 Flujo de Trabajo

### Desarrollo → Producción:
```bash
# 1. Desarrollo en feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Testing en staging
./scripts/environments/staging/deploy.sh

# 3. Si pasa testing, merge a main
git checkout main
git merge feature/nueva-funcionalidad

# 4. Deploy a producción
./scripts/environments/production/deploy.sh

# 5. Monitoreo post-deploy
```

### Hotfix en producción:
```bash
# 1. Crear hotfix branch desde main
git checkout -b hotfix/nombre-fix main

# 2. Aplicar fix
# 3. Testing rápido en staging
./scripts/environments/staging/deploy.sh

# 4. Merge a main
git checkout main
git merge hotfix/nombre-fix

# 5. Deploy a producción
./scripts/environments/production/deploy.sh

# 6. Verificar fix
```

### Rollback:
```bash
# 1. Identificar deploy estable anterior
vercel list [project]

# 2. Rollback
vercel rollback [deployment-id]

# 3. Notificar usuarios si necesario
```

## 📊 Monitoreo

### Métricas críticas:
1. **Uptime**: > 99.9%
2. **Response time**: < 200ms (p95)
3. **Error rate**: < 0.1%
4. **Throughput**: Requests por segundo
5. **User satisfaction**: Core Web Vitals

### Herramientas recomendadas:
- **Vercel Analytics**: Performance y errores
- **Sentry**: Error tracking
- **UptimeRobot**: Uptime monitoring
- **Google Analytics**: User behavior
- **MongoDB Atlas Metrics**: Database performance

### Alertas configurar:
1. **Uptime < 99%** (crítico)
2. **Error rate > 1%** (crítico)
3. **Response time > 1s** (advertencia)
4. **Database storage > 80%** (advertencia)
5. **Failed logins > 100/hora** (seguridad)

## 🛠️ Solución de Problemas

### Problemas comunes:
1. **Deploy fallido**: Rollback y debugging
2. **Performance issues**: Scaling y optimización
3. **Database issues**: Backup restore
4. **Security incidents**: Rotación de credenciales
5. **User reports**: Log analysis y hotfix

### Proceso de troubleshooting:
1. **Identificar** el problema
2. **Aislar** el componente afectado
3. **Diagnosticar** causa raíz
4. **Implementar** solución
5. **Verificar** que solución funciona
6. **Documentar** para futuro

### Herramientas de debugging:
- **Vercel Logs**: `vercel logs --prod`
- **MongoDB Atlas Logs**: Cloud console
- **Browser DevTools**: Frontend issues
- **Network analysis**: Wireshark, Charles Proxy
- **Performance profiling**: Lighthouse, WebPageTest

## 🔗 Recursos

### Documentación:
- **Vercel Production**: https://vercel.com/docs/deployments/production
- **MongoDB Atlas Production**: https://docs.atlas.mongodb.com/best-practices/
- **Next.js Production**: https://nextjs.org/docs/deployment
- **Expo Production**: https://docs.expo.dev/distribution/app-stores/

### Herramientas:
- **Performance**: Lighthouse, WebPageTest
- **Security**: OWASP ZAP, Snyk
- **Monitoring**: Sentry, Datadog, New Relic
- **Backup**: MongoDB Atlas Backup, Vercel Deployments

### Soporte:
- **Vercel Support**: https://vercel.com/support
- **MongoDB Support**: https://www.mongodb.com/support
- **Expo Support**: https://expo.dev/support
- **Community**: GitHub Discussions, Discord

## 📞 Contacto y Soporte

### Equipo responsable:
- **DevOps/Infra**: Configuración y monitoreo
- **Development**: Deployment y hotfixes
- **QA/Testing**: Verificación pre/post-deploy
- **Product/Support**: Comunicación con usuarios

### Canales de comunicación:
- **Incidentes críticos**: Slack/Teams channel #production-alerts
- **Soporte técnico**: GitHub Issues, Email
- **Comunicación usuarios**: Status page, Email, App notifications

### Escalación:
1. **Nivel 1**: Automated alerts y auto-recovery
2. **Nivel 2**: On-call engineer (24/7)
3. **Nivel 3**: Senior engineer/architect
4. **Nivel 4**: Director/VP (solo para incidentes críticos)

---

**Nota**: Producción maneja datos reales de usuarios. Siempre proceder con cautela y tener backups antes de cambios importantes.
