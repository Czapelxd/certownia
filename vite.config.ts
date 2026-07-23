/// <reference types="vitest/config" />
import { defineConfig } from "vite";

// Certownia is a static, client-side app. The only server-side piece is a thin
// ACME CORS proxy (see functions/ for Cloudflare Pages, proxy/ for self-hosting).
// base defaults to "/" (Cloudflare Pages, Netlify, custom domains). For a
// GitHub Pages *project* site served from /<repo>/, set VITE_BASE=/certownia/.
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  build: {
    target: "es2022",
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
