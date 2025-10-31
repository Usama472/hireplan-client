import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from the current directory
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    build: {
      target: ["es2015", "safari11", "ios11"],
      polyfillModulePreload: true,
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        safari10: true,
        compress: {
          passes: 2,
          pure_getters: true,
          unsafe: false,
        },
        mangle: {
          safari10: true,
        },
      },
      rollupOptions: {
        output: {
          // Add timestamp to filenames for cache busting
          entryFileNames: `assets/[name].[hash].${Date.now()}.js`,
          chunkFileNames: `assets/[name].[hash].${Date.now()}.js`,
          assetFileNames: `assets/[name].[hash].${Date.now()}.[ext]`,
          manualChunks: {
            vendor: ['react', 'react-dom'],
            motion: ['framer-motion']
          }
        }
      }
    },
    define: {
      // Explicitly expose environment variables
      "import.meta.env.VITE_STRIPE_STARTER_PRICE_ID": JSON.stringify(
        env.VITE_STRIPE_STARTER_PRICE_ID
      ),
      "import.meta.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID": JSON.stringify(
        env.VITE_STRIPE_PROFESSIONAL_PRICE_ID
      ),
      "import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID": JSON.stringify(
        env.VITE_STRIPE_ENTERPRISE_PRICE_ID
      ),
      "import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY": JSON.stringify(
        env.VITE_STRIPE_PUBLISHABLE_KEY
      ),
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      allowedHosts: [
        "hireplan.co",
        "www.hireplan.co",
        "localhost",
        "127.0.0.1",
        "45.33.83.41",
        "b8e8159b256e.ngrok-free.app",
      ],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@context": path.resolve(__dirname, "./src/context"),
        "@hooks": path.resolve(__dirname, "./src/lib/hooks"),
        "@constants": path.resolve(__dirname, "./src/constants"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@utils": path.resolve(__dirname, "./src/lib/utils"),
        "@interfaces": path.resolve(__dirname, "./src/interfaces"),
      },
    },
  };
});
