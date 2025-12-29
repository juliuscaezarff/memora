import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
    "api/index": "./src/vercel.ts",
  },
  format: "esm",
  outDir: "./dist",
  clean: true,
  noExternal: [/@memora\/.*/, /^hono.*/, /^@hono.*/],
});
