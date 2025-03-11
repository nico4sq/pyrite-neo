// @ts-check
import { defineConfig } from "astro/config";
import netlify from '@astrojs/netlify';
import tailwindcss from "@tailwindcss/vite";

import svelte from '@astrojs/svelte';

import react from "@astrojs/react";

import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    define: {
      "process.env": {},
      'import.meta.env.PUBLIC_API_URL': JSON.stringify(process.env.PUBLIC_API_URL || ''),
      'import.meta.env.PUBLIC_CUSTOM_QUERY_URL': JSON.stringify(process.env.PUBLIC_CUSTOM_QUERY_URL),
    }
  },
  integrations: [
    svelte(),
    db()
  ],
  adapter: netlify(),
});