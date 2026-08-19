# Demo Web/App Fiducia + MI FONDO (Amplitude Demo)

Esta es una SPA moderna, elegante y premium inspirada en la identidad visual de **Fiducia** y **MI FONDO**, creada específicamente para demostrar la integración y capacidades del ecosistema **Amplitude** (Analytics, Session Replay, Experiment) con una arquitectura de persistencia real cross-device.

## Arquitectura de la Aplicación

La plataforma ha sido reconstruida para ofrecer una experiencia real de retención de estado a través de múltiples dispositivos, utilizando tecnologías modernas:

### Frontend
- **React 19 + Vite**
- **TypeScript** para seguridad de tipos
- **Tailwind CSS** para estilos de diseño premium
- **Framer Motion** para micro-interacciones suaves

### Identidad
- **Firebase Authentication** maneja el registro e inicio de sesión seguro (Email/Password).

### Persistencia cross-device
- **Cloud Firestore** almacena el perfil del usuario (estado, saldos, fondos activos). Esto actúa como la **fuente de verdad del perfil autenticado**, garantizando que un usuario vea el mismo estado sin importar desde qué dispositivo inicie sesión.

### Analytics
- **Amplitude Analytics Browser SDK** captura todos los eventos del negocio (Tracking Plan estricto de 11 eventos).

### Session Replay
- **Amplitude Session Replay Browser Plugin** captura interacciones de interfaz, aplicando reglas de privacidad y enmascaramiento (`maskSelector`) sobre campos sensibles (contraseñas, cédulas, correos).

### Experiment
- **Amplitude Experiment JavaScript Client SDK** permite gestionar variantes y tests A/B en tiempo real, evaluando identidades tanto anónimas como autenticadas.

### Persistencia local
El uso de `localStorage` está restringido exclusivamente a funciones de caché secundario:
- Estado temporal del journey (por ejemplo, parámetros de un simulador antes del login).
- Caché de UTMs.
- Estado de navegación.

## Cross-Device y la Identidad en Amplitude

El sistema garantiza una unificación perfecta de identidad entre dispositivos:

1. Un usuario que se registra con `usuario@ejemplo.com` puede entrar posteriormente desde su desktop, celular, tablet u otro navegador.
2. En cada inicio de sesión, **Firebase Authentication devuelve el mismo `uid`** universal.
3. Ese UID se inyecta directamente como el **`user_id` de Amplitude**.
4. Cada navegador/dispositivo mantiene su propio identificador de hardware (`device_id`).

**Ejemplo Analítico:**
```text
Desktop:
user_id = abc123
device_id = desktop_xyz

Mobile:
user_id = abc123
device_id = mobile_789
```
Esto permite que Amplitude agrupe correctamente ambos flujos (Desktop y Mobile) bajo el mismo Perfil de Usuario consolidado sin depender del email.

### Cómo probar cross-device:

**Desktop:**
1. Abre la aplicación.
2. Haz clic en "Abrir mi cuenta" y completa el onboarding.
3. Verifica que estás autenticado en el Dashboard.
4. Realiza una simulación de inversión.

**Mobile:**
1. Abre la misma aplicación (URL publicada).
2. Haz clic en "Ingresar" e inicia sesión con el mismo email y contraseña.
3. Confirmarás que aparece el mismo perfil y datos persistidos desde Desktop.
4. En **Amplitude**, verifica que los eventos enviados desde ambos `device_id` comparten el mismo `user_id`.

## Flujo de Logout (Cierre de Sesión)

El proceso de logout garantiza una limpieza segura para evitar que el próximo usuario (o el mismo en estado anónimo) herede comportamientos:

1. **Firebase `signOut`**: Cierra la sesión en la nube.
2. **Experiment `clear`**: Limpia cualquier variante cacheada del usuario anterior.
3. **Amplitude `reset`**: Resetea la identidad (generando un nuevo `device_id` anónimo) y borra el `user_id`.
4. El usuario regresa a estado anónimo y es redirigido al Home.
*(Los datos en Firestore no se eliminan y quedan listos para el próximo login).*

## Configurar Firebase

Para correr el proyecto localmente o en producción, necesitas habilitar un proyecto de Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com/) y crea un nuevo proyecto.
2. Registra una nueva **Web App** (icono de web `</>`).
3. Copia el objeto de configuración.
4. Ve a **Authentication** > **Sign-in method** y habilita el proveedor de **Correo electrónico/Contraseña**.
5. Ve a **Firestore Database** y crea una base de datos.
6. Asegúrate de que las reglas de Firestore permitan escritura/lectura para la colección `users/{uid}`.

## Variables de Entorno

Crea un archivo `.env` en la raíz (puedes copiar el `.env.example`) y completa las variables:

```env
# Configuración de Analytics y Experiment
VITE_AMPLITUDE_API_KEY=tu_api_key
VITE_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY=tu_deployment_key
VITE_AMPLITUDE_SERVER_ZONE=US

# Credenciales generadas por Firebase
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-app
VITE_FIREBASE_STORAGE_BUCKET=tu-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:1234:web:abcd
```

### Amplitude Experiment
La clave `VITE_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY` es necesaria para evaluar flags. Si no se provee, la app seguirá funcionando mediante _fallbacks_ sin romper los journeys. Tras el login, Experiment volverá a evaluar variantes específicas para el nuevo usuario de forma automática. Al hacer logout, las variantes se limpiarán.

## Cómo Instalar y Correr Localmente

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Ejecuta el entorno de desarrollo:
   ```bash
   npm run dev
   ```
3. Abre el puerto indicado (por defecto `http://localhost:3000`).

## Cómo hacer Build y Deploy (GitHub Pages)

La aplicación usa `HashRouter` y una ruta base relativa, lo que la hace 100% compatible con GitHub Pages sin configuraciones complejas de enrutamiento estático.

1. Genera los archivos optimizados:
   ```bash
   npm run build
   ```
2. El código listo para producción estará en la carpeta `dist/`.
3. Sube la carpeta a la rama de `gh-pages` o configura tu repositorio para desplegar directamente desde Actions.
