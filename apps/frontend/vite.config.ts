import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@prism/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts')
        }
    },
    optimizeDeps: {
        exclude: [
            'class-transformer',
            'class-validator',
            '@nestjs/mapped-types'
        ]
    }
})
