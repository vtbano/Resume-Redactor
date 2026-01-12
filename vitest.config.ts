import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      lib: path.resolve(__dirname, './app/lib'),
      components: path.resolve(__dirname, './app/components'),
      types: path.resolve(__dirname, './app/types'),
      public: path.resolve(__dirname, './public'),
    },
  },
})
