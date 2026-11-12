/**
 * Web-compat verification untuk @fs-management/auth.
 *
 * 1. Bundle check — bundle src/index.ts untuk browser dengan stub .web.ts:
 *    assert tidak ada NativeBiometricAuth / TurboModuleRegistry di output.
 * 2. Runtime smoke — import bundle di Node, pastikan ApiClient cookie mode
 *    mengirim credentials:'include' dan tidak mengirim Authorization header.
 */
import { build } from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const sharedNativeDir = path.resolve(pkgRoot, '../shared/src/native');

const WEB_STUBS = {
  NativeSecureStorage: path.join(sharedNativeDir, 'NativeSecureStorage.web.ts'),
  NativeNetworkMonitor: path.join(sharedNativeDir, 'NativeNetworkMonitor.web.ts'),
};

// Redirect import native modules ke stub .web.ts (esbuild tidak resolve .web.ts otomatis)
const webStubPlugin = {
  name: 'web-stubs',
  setup(b) {
    b.onResolve({ filter: /Native(SecureStorage|NetworkMonitor)$/ }, (args) => {
      const name = args.path.split('/').pop();
      if (WEB_STUBS[name]) {
        return { path: WEB_STUBS[name] };
      }
      return null;
    });
  },
};

// ---------- 1. Bundle check ----------
const result = await build({
  entryPoints: [path.join(pkgRoot, 'src/index.ts')],
  bundle: true,
  write: false,
  platform: 'browser',
  format: 'esm',
  plugins: [webStubPlugin],
  external: ['react-native'],
  logLevel: 'silent',
});

const code = result.outputFiles[0].text;

assert(!code.includes('RTNBiometricAuth'), 'bundle mengandung RTNBiometricAuth');
assert(!code.includes('NativeBiometricAuth'), 'bundle mengandung NativeBiometricAuth');
assert(!code.includes('TurboModuleRegistry'), 'bundle mengandung TurboModuleRegistry');
assert(!code.includes('getEnforcing'), 'bundle mengandung getEnforcing');
assert(code.includes('onLine'), 'stub NativeNetworkMonitor.web tidak ter-resolve');
console.log('✓ bundle check passed — tidak ada RN-only module di web bundle');

// ---------- 2. Runtime smoke: cookie mode ----------
const tmpFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'auth-web-')), 'bundle.mjs');
fs.writeFileSync(tmpFile, code);

const mod = await import(pathToFileURL(tmpFile).href);
assert(typeof mod.getApiClient === 'function', 'getApiClient tidak ter-export');
assert(typeof mod.useAuthStore === 'function' || typeof mod.useAuthStore?.getState === 'function', 'useAuthStore tidak ter-export');

let captured;
globalThis.fetch = async (_url, opts) => {
  captured = opts;
  return new Response(JSON.stringify({ user: { id: '1' } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

const api = mod.getApiClient({ baseUrl: 'http://localhost:8080', authMode: 'cookie' });
api.setToken('should-be-ignored');
await api.getMe();

assert.equal(captured.credentials, 'include', 'cookie mode harus kirim credentials:include');
assert.equal(captured.headers.Authorization, undefined, 'cookie mode tidak boleh kirim Authorization header');
console.log('✓ smoke test passed — cookie mode pakai credentials:include tanpa Bearer token');

fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true });
console.log('test:web OK');
