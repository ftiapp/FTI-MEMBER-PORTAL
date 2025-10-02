import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "prettier"),
  // Optional: enable Prettier as ESLint rule (treat format issues as ESLint errors):
  // {
  //   plugins: { prettier: await import("eslint-plugin-prettier") },
  //   rules: { "prettier/prettier": "error" }
  // }
];

export default eslintConfig;
