import tailwindApplyOrder from "./scripts/stylelint/tailwind-apply-order.mjs";

const config = {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["**/.next/**", "**/node_modules/**"],
  plugins: [tailwindApplyOrder],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["apply", "reference", "theme"],
      },
    ],
    "color-hex-length": null,
    "function-url-quotes": null,
    "import-notation": null,
    "no-duplicate-selectors": null,
    "selector-class-pattern": null,
    "custom/tailwind-apply-order": true,
  },
};

export default config;
