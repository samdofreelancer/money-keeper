module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  overrides: [
    // TypeScript files
    {
      files: ["*.ts"],
      parser: "@typescript-eslint/parser",
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
      ],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
      plugins: ["@typescript-eslint", "prettier", "import"],
      rules: {
        "prettier/prettier": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_" },
        ],
        "import/order": [
          "error",
          {
            groups: [["builtin", "external", "internal"]],
            "newlines-between": "always",
          },
        ],
      },
    },
    // JavaScript files
    {
      files: ["*.js"],
      extends: ["eslint:recommended", "plugin:prettier/recommended"],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      plugins: ["prettier", "import"],
      rules: {
        "prettier/prettier": "error",
        "import/order": [
          "error",
          {
            groups: [["builtin", "external", "internal"]],
            "newlines-between": "always",
          },
        ],
      },
    },
  ],
  ignorePatterns: [
    "dist/**/*",
    "node_modules/**/*",
    "reports/**/*",
    ".eslintrc.js",
    "cucumber.js",
  ],
};
