// Web config — di-resolve Vite/Astro (.web.ts didahulukan dari .ts).
// baseUrl kosong = relative URL → same-origin, lewat proxy dev / reverse proxy
// production ke backend (Rust/Go) di port 8080.
export const API_BASE_URL = '';
export const AUTH_MODE: 'bearer' | 'cookie' = 'cookie';
