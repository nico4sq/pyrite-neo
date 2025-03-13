// @ts-check
import { defineConfig } from "astro/config";
import netlify from '@astrojs/netlify';
import tailwindcss from "@tailwindcss/vite";
import svelte from '@astrojs/svelte';

import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    define: {

      'import.meta.env.PUBLIC_API_URL': JSON.stringify(process.env.PUBLIC_API_URL || ''),
      'import.meta.env.PUBLIC_CUSTOM_QUERY_URL': JSON.stringify(process.env.PUBLIC_CUSTOM_QUERY_URL),
      'import.meta.env.MAIL_HOST': JSON.stringify(process.env.MAIL_HOST),
      'import.meta.env.MAIL_PORT': JSON.stringify(process.env.MAIL_PORT),
      'import.meta.env.MAIL_SECURE': JSON.stringify(process.env.MAIL_SECURE),
      'import.meta.env.MAIL_USER': JSON.stringify(process.env.MAIL_USER),
      'import.meta.env.MAIL_PASSWORD': JSON.stringify(process.env.MAIL_PASSWORD),
      'import.meta.env.JWT_SECRET': JSON.stringify(process.env.JWT_SECRET),
    }
  },
  integrations: [
    svelte(),
    db()
  ],
  adapter: netlify(),
  output: 'server'
});