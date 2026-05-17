import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// BUG FIX: The original threw a hard Error when PORT or BASE_PATH were not
// set.  This crashes the dev server if you start it outside of the Replit
// artifact runner (e.g. plain `pnpm dev`).  Fall back to safe defaults so
// the server always starts; Replit's artifact runner will override them via
// the [services.env] block in artifact.toml.
const rawPort = process.env.PORT ?? "18913";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "attached_assets",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: false,
    host: "0.0.0.0",
    allowedHosts: true,
    headers: {
      "Cache-Control": "no-store",
    },
    fs: {
      strict: false,
      allow: ["../.."],
    },
    // BUG FIX: No proxy was configured.  The frontend makes fetch calls to
    // relative paths like `/api/...`.  In development those go to the Vite
    // dev server (port 18913) which has no /api handler — every API request
    // returns a 404 / HTML page, so auth fails and the app shows blank.
    //
    // Replit's path-based router (artifact.toml `paths = ["/api"]`) only
    // applies to the *external* URL served by Replit's edge, not to the
    // Vite dev server itself.  We must explicitly proxy /api → backend.
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // Do NOT rewrite — the backend mounts its router at /api so the
        // prefix must be preserved.
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
