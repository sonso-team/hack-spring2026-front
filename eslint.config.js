// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';

export default [
  // Базовые рекомендации JS и TS
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Притаскиваем Prettier как flat-конфиг
  prettierRecommended,

  // Наш слой правил (чтобы не тянуть legacy-конфиги плагинов)
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.eslint.json',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
            project: './tsconfig.json'
          },
          node: {
            extensions: ['.js', '.jsx', '.ts', '.tsx']
          }
        },
    },
    rules: {

      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
          js: 'never',
          jsx: 'never'
        }
      ],
      // чуть построже
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',

      // React (минимум без legacy-конфигов)
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // Hooks — вручную включаем рекомендованные
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-key': 'error', // обязателен key в списках
      'react/self-closing-comp': 'warn', // <Foo></Foo> → <Foo />
      'react/jsx-no-duplicate-props': 'error', // без дубликатов props
      'eqeqeq': ['error', 'always'], // всегда использовать === вместо ==
      'no-var': 'error', // запрещаем var
      'prefer-const': 'error', // если переменная не меняется → const
      'no-implicit-coercion': 'warn', // запрещает странные штуки типа !!foo или +bar
      'curly': ['error', 'all'], // всегда фигурные скобки, даже в if на 1 строку
      'no-fallthrough': 'error', 
      'no-unused-vars': 'off', // отключаем дефолт
      '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
        ],
      'no-multi-spaces': 'warn', // запрет двойных пробелов
      'no-trailing-spaces': 'warn', // без хвостовых пробелов
      'eol-last': ['error', 'always'], // всегда пустая строка в конце файла
      'object-shorthand': ['warn', 'always'], // { foo: foo } → { foo }
      'prefer-template': 'warn', // вместо конкатенации 'a' + b → `a${b}`
      'arrow-body-style': ['warn', 'as-needed'], // () => { return x } → () => x
      'prefer-arrow-callback': 'warn', // function() {} → () => {}
      'import/order': [
        'warn',
          {
            groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
            'newlines-between': 'always',
            alphabetize: { order: 'asc', caseInsensitive: true }
          }
        ],
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'warn'


    },
  },

  // Игноры (замена .eslintignore)
  {
    ignores: ['dist', 'build', 'coverage', 'node_modules', '**/*.config.ts', '**/*.config.js'],
  },
];
