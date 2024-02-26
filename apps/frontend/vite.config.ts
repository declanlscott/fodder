import react from "@vitejs/plugin-react-swc";
import { FontaineTransform } from "fontaine";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    FontaineTransform.vite({
      fallbacks: ["Arial", "Roboto"],
    }),
  ],
});
