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
  },
  integrations: [svelte(), db()],
  adapter: netlify(),
});