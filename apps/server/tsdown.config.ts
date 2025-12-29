import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  format: "esm",
  outDir: "./dist",
  clean: true,
  noExternal: [/@memora\/.*/, /^@orpc\//, /^hono/, /^better-auth/],
  external: ["@prisma/client"],
  treeshake: true,
  bundle: true,
});
