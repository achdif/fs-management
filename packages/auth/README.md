# @fs-management/auth

Package auth untuk FSM — support **React Native (bearer token + secure storage)** dan **web/Astro (HttpOnly cookie)**.

## Arsitektur

- **Bearer mode (mobile, default)** — token disimpan di secure storage (`@fs-management/shared` → `NativeSecureStorage`), dikirim via `Authorization: Bearer`.
- **Cookie mode (web)** — token disimpan backend sebagai HttpOnly cookie; JS tidak pernah menyimpan/mengirim token. Aktifkan dengan `authMode: 'cookie'` di `getApiClient` dan `cookieAuth: true` di `useAuth`.
- **Biometric** — `NativeBiometricAuth` RN-only, tidak di-export dari entry utama. Import langsung: `@fs-management/auth/src/native/NativeBiometricAuth`.
- **Storage & native infra** — `createAuthStorage`, `AuthStorage`, `StorageKeys`, `NativeSecureStorage`, `NativeNetworkMonitor` ada di `@fs-management/shared` (juga di-re-export dari package ini untuk backward compat).

## Pemakaian di web (Astro/Vite)

```ts
import { getApiClient, useAuth, useAuthStore } from '@fs-management/auth';

// Sekali, di client component / layout:
getApiClient({ baseUrl: '/api/v1', authMode: 'cookie' });

// Di komponen React:
const { login, logout, checkAuth, isAuthenticated } = useAuth({ cookieAuth: true });
```

Catatan:

- `useAuth` adalah React hook → hanya di client component Astro (`client:load`), bukan frontmatter.
- Vite/Astro tidak auto-resolve `.web.ts` — tambahkan di config:

```ts
// astro.config.mjs / vite.config.ts
export default defineConfig({
  vite: {
    resolve: {
      extensions: ['.web.ts', '.web.tsx', '.ts', '.tsx', '.js', '.jsx'],
    },
  },
});
```

- Same-origin proxy disarankan: Astro dev proxy `/api` → backend Rust; production via reverse proxy. Backend sudah set cookie `httpOnly` + middleware fallback baca cookie.

## Verifikasi web-compat

```bash
pnpm --filter @fs-management/auth test:web
```

Bundle check (esbuild browser + stub `.web.ts`) + smoke test cookie mode.
