module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // 关闭一些过于严格的规则
    'react/react-in-jsx-scope': 'off', // React 17+ 不需要显式导入 React
    'react/prop-types': 'off', // TypeScript 已经有类型检查
    '@typescript-eslint/no-explicit-any': 'warn', // any 类型警告而非错误
    '@typescript-eslint/explicit-module-boundary-types': 'off', // 不强制导出函数显式返回类型
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }], // 未使用变量警告，_ 开头的忽略
    '@typescript-eslint/no-var-requires': 'off', // 允许 require 导入（Electron 需要）
    '@typescript-eslint/no-require-imports': 'off', // 允许 require 导入（Electron 需要）
    
    // React Hooks 规则
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // 基础规则
    'no-console': 'off', // 允许 console
    'prefer-const': 'warn',
    'no-debugger': 'warn'
  },
  ignorePatterns: [
    'dist',
    'build',
    'release',
    'node_modules',
    '*.config.js',
    '*.config.ts',
    'electron/electron/**/*.js' // 忽略编译后的 electron 文件
  ]
};