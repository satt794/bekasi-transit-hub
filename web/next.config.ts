import type { NextConfig } from "next";

/**
 * Alamat backend FastAPI. Browser tidak memanggil backend langsung —
 * semua request ke `/api/*` di-proxy oleh Next.js lewat rewrites di bawah,
 * jadi tidak perlu urusan CORS dan URL backend tidak bocor ke client.
 *
 * Catatan: nilai ini dibaca saat `next build` / `next dev` dijalankan.
 */
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
