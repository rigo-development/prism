import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'jsdom',
        globals: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@prism/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts')
        }
    }
});
