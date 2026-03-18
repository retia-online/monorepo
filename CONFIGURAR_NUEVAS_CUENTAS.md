# Cómo Agregar Cuentas/Repositorios Adicionales

Este monorepo está configurado para sincronizarse con múltiples cuentas o repositorios remotos (actualmente `megamercado` y `retia`). Esto permite mantener la misma base de código centralizada, pero desplegar o enviar actualizaciones a diferentes organizaciones o clientes configurando ramas y variables de entorno específicas.

Si deseas agregar una nueva cuenta a esta lógica, debes seguir los pasos detallados a continuación:

## 1. Configurar el nuevo repositorio remoto localmente

Para poder interactuar con la nueva cuenta/repositorio desde tu máquina local (por ejemplo, para enviar cambios de base), primero debes agregarlo como un remoto en tu Git local.

Crear Repositorio Vacio en Github .com

Invitar al Usuario a Colaborar en el Nuevo Repositorio
luis@ovalles.net

```bash
# Reemplaza 'nuevo_cliente' con el nombre del cliente y la URL correcta
git remote add nuevo_cliente https://github.com/nueva_cuenta/monorepo.git
```

Para verificar que se ha configurado correctamente, puedes listar tus remotos:
```bash
git remote -v
```

De esta forma, puedes hacer PUSH de tu código base a esta nueva cuenta cuando lo necesites:
```bash
git push nuevo_cliente main
```

## 2. Inyectar Accesos al Flujo de CI/CD (GitHub Actions)

Dado que usas GitHub Actions para enviar el código a diferentes repositorios automáticamente al actualizar, necesitarás dar permisos para que GitHub pueda empujar al nuevo repositorio.

1. **Crear Token de Acceso:** 
   Ve a la cuenta de GitHub del **nuevo cliente** y genera un **Personal Access Token (PAT)** (Classic o Fine-grained) con permisos para leer/escribir código (`repo`).

2. **Guardar el Secreto:** 
   Ve al repositorio original (el principal desde el que lanzas las Actions) y dirígete a:
   `Settings` -> `Secrets and variables` -> `Actions`
   
3. **Añadir el Secreto:** 
   Agrega el token que copiaste bajo un nombre claro, por ejemplo: `NUEVO_CLIENTE_TOKEN`.

## 3. Actualizar la lógica en los Workflows de GitHub Actions

Ahora debes indicar a GitHub Actions que, cuando haya un cambio, también lo replique o despliegue para la nueva cuenta.

1. Abre los archivos relevantes dentro de `.github/workflows/` (ej. `sync.yml` o `deploy.yml`).
2. Agrega un paso (`step`) o trabajo (`job`) nuevo que envíe el código usando el secreto que acabas de configurar. Un ejemplo de este bloque sería:

```yaml
- name: Push to Nuevo Cliente
  env:
    GITHUB_TOKEN: ${{ secrets.NUEVO_CLIENTE_TOKEN }}
  run: |
    # Añade el remoto para la acción actual
    git remote add nuevo_cliente https://oauth2:${GITHUB_TOKEN}@github.com/nueva_cuenta/monorepo.git
    # Empuja los cambios
    git push nuevo_cliente main
```
*(Nota: Ajusta los nombres de las ramas de ser necesario dependiendo de si usas `main`, `master` u otra rama).*

## 4. Configurar el SDK y Variables de Entorno del Cliente

Al ser un monorepo que se adapta a cada cliente (como `megamercado` vs `retia`), lo más probable es que el código necesite saber para qué entorno se está ejecutando (para colores, logos, conexiones a DB, etc.).

1. **Archivos `.env`:** Si utilizas `.env.template`, asegúrate de instruir la configuración de variables clave para el nuevo cliente.
   ```env
   COMPANY=nuevo_cliente
   NEXT_PUBLIC_COMPANY=nuevo_cliente
   ```

2. **Plataforma de Despliegue (Ej. Vercel / Expo):** Si el nuevo cliente va a tener despliegues propios de la Web o la App, asegúrate de crear el proyecto en su respectiva plataforma de despliegue y colocar la variable de entorno `COMPANY=nuevo_cliente` para que tu código cambie los estilos o lógicas de SDKs adecuadamente durante el build de este nuevo entorno.
