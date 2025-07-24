import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Treat TypeScript any type as warning instead of error for now
      "@typescript-eslint/no-explicit-any": "warn",
      // Treat empty object types as warning
      "@typescript-eslint/no-empty-object-type": "warn",
      // Treat unused variables as warnings
      "@typescript-eslint/no-unused-vars": "warn",
      // Treat missing dependencies as warnings
      "react-hooks/exhaustive-deps": "warn",
      // Allow unescaped entities for now
      "react/no-unescaped-entities": "warn"
    }
  }
];

export default eslintConfig;
