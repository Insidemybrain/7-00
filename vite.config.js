import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    https: {
        key: './myapp-privateKey.key',
        cert: './myapp.crt'
    }
  }
});