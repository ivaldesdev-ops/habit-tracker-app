import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/habit-tracker-app/',  // ← Exact folder name with trailing slash!
});