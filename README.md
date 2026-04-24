# GardenGenie

App móvil React Native (Expo) para identificar y gestionar plantas con IA, autenticación Google y sincronización Firebase.

---

## Requisitos previos

- Node.js 18+
- JDK 21 ([Eclipse Adoptium](https://adoptium.net/))
- Android Studio con un emulador **Google Play** (Pixel 9 Pro API 36 recomendado)
- Variables de entorno configuradas en `.env` (ver `.env.example`)

---

## Instalación

```bash
npm install
```

---

## Ejecutar en emulador Android

Este proyecto usa módulos nativos (`expo-dev-client`, `react-native-google-signin`) que **no funcionan en Expo Go**. Siempre usar el dev client.

### Primera vez (compilar APK de desarrollo)

```bash
npx expo run:android
```

Esto compila e instala el APK en el emulador. Solo necesario al agregar/cambiar módulos nativos.

### Ejecuciones siguientes (arranque rápido)

Abrir **dos terminales**:

**Terminal 1 — túnel de red:**
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
```

**Terminal 2 — servidor Metro:**
```bash
npx expo start --localhost
```

Luego presionar `a` en Metro para abrir la app en el emulador.

> **Por qué `adb reverse`:** El emulador no puede alcanzar la IP LAN del host. `adb reverse` redirige el puerto 8081 del emulador al host, permitiendo que `--localhost` funcione.

### Limpiar caché (si la app no carga o hay errores extraños)

```bash
npx expo start --clear --localhost
```

---

## Google Sign-In — configuración necesaria

Para que Google Sign-In funcione en un build de desarrollo:

1. El emulador debe tener **Google Play Services** y una **cuenta Google** agregada  
   (Settings → Accounts → Add account → Google)
2. El SHA-1 del keystore de debug debe estar registrado en Firebase Console  
   (Project Settings → Your apps → Android app → Add fingerprint)

Para obtener el SHA-1 del keystore de debug del proyecto:

```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot\bin\keytool.exe" `
  -list -v `
  -keystore "android\app\debug.keystore" `
  -alias androiddebugkey `
  -storepass android -keypass android
```

---

## Firestore Security Rules

Las reglas mínimas necesarias para que la app funcione (Firebase Console → Firestore → Rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Estructura principal

```
app/          # Rutas (expo-router)
src/
  components/ # Componentes reutilizables (OfflineBanner, FormInput, ...)
  config/     # Firebase (firebase.ts)
  context/    # AuthContext
  hooks/      # useNetworkStatus
  screens/    # Pantallas
  services/   # plantIdService, cameraService, permissionService
  theme/      # Design system
android/      # Proyecto Android nativo
```

---

## Variables de entorno

Crear `.env` en la raíz con:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_PLANT_ID_API_KEY=
```
