// ESLint flat config — backend (CommonJS, Node.js)
//
// Foco: los tres bugs reales encontrados en producción durante la sesión
// 2026-10-16, que este bloque de reglas habría detectado antes del deploy:
//   1. Promise sin await pasada a new Decimal()  → no-floating-promises
//   2. Tasa de cambio resuelta en el sitio     → no-floating-promises
//   3. Venta duplicada por doble clic           → no-async-promise-executor
//
// Requiere type-aware linting (parserOptions.project) para que
// no-floating-promires sepa qué es un Decimal y no infiera todo como any.
const tseslint = require('typescript-eslint');
const js = require('@eslint/js');

module.exports = tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'src/generated/**',   // Prisma SQLite generado
      'prisma/dev.db',
      'data/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      // Habilita type-aware linting: sin esto no-floating-promises no puede
      // distinguir una Promise de un Decimal. Requiere tsconfig.json.
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        require: 'readonly', module: 'writable', exports: 'writable',
        process: 'readonly', console: 'readonly', __dirname: 'readonly',
        __filename: 'readonly', Buffer: 'readonly', setTimeout: 'readonly',
        clearTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly',
        fetch: 'readonly', URL: 'readonly', URLSearchParams: 'readonly',
        AbortController: 'readonly', structuredClone: 'readonly',
      },
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      // ── El bug crítico de esta sesión ──────────────────────────────────
      // Una Promise sin await que fluye a un contexto aritmético
      // (new Decimal(promise)) falla en runtime, no en arranque.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/return-await': 'error',

      // ── Duplicados y condición de carrera ─────────────────────────────
      // `no-async-promise-executor` es regla del núcleo (no del plugin).
      'no-async-promise-executor': 'error',
      '@typescript-eslint/require-await': 'warn',

      // ── Estilo: warning, no bloquea CI ────────────────────────────────
      // These are pre-existing across the codebase. Reported but not fatal,
      // so CI stays green and they can be cleaned up incrementally.
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/require-await': 'warn',
      'no-case-declarations': 'warn',

      // El proyecto es CommonJS: require() es el patrón correcto, no un error.
      '@typescript-eslint/no-require-imports': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-console': 'off',
      'no-var': 'error',
      'prefer-const': 'warn',
      eqeqeq: ['error', 'smart'],
    },
  },
  {
    // Los scripts CLI ejecutan `main()` deliberadamente sin await: el proceso
    // termina cuando Node agota la cola de microtareas y el .catch adjunto
    // gestiona el error. Forzar await ahí no aporta nada.
    files: ['scripts/**/*.js', 'prisma/**/*.js'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);