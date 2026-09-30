import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config for the ShelfBuddy frontend (plain JS + React).
// The dev server proxies /api requests to the Express backend so the
// browser only ever talks to our own origin (see server/index.js).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
