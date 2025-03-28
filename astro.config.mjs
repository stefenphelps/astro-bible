import { defineConfig } from "astro/config";
import AstroPWA from "@vite-pwa/astro";
import sitemap from "@astrojs/sitemap";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  site: "https://bible.stefenphelps.com",
  trailingSlash: "always",
  output: "server",
  compressHTML: true,
  prefetch: true,
  integrations: [
    sitemap(),
    AstroPWA({
      manifest: {
        base: "/",
        scope: "/",
        orientation: "portrait-primary",
        name: "The Simple Bible",
        short_name: "Bible",
        description: "A well designed simple Bible app powered by Astro.",
        categories: ["books", "education", "religious"],
        screenshots: [
          {
            src: "home-dark.PNG",
            sizes: "1179x2556",
            type: "image/png",
            platform: "narrow",
            label: "Homescreen in dark mode",
          },
          {
            src: "home-light.PNG",
            sizes: "1179x2556",
            type: "image/png",
            platform: "narrow",
            label: "Homescreen in light mode",
          },
          {
            src: "verse-dark.PNG",
            sizes: "1179x2556",
            type: "image/png",
            platform: "narrow",
            label: "Genesis 1:2 in dark mode",
          },
          {
            src: "verse-light.PNG",
            sizes: "1179x2556",
            type: "image/png",
            platform: "narrow",
            label: "Genesis 1:2 in light mode",
          },
        ],
        start_url: "https://bible.stefenphelps.com",
        theme_color: "#fff7ed",
        background_color: "#fff7ed",
        display: "standalone",
        includeAssets: ["*.{png,ico,svg,jpg,xml}"],
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/safari-pinned-tab.svg",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
    }),
  ],
  adapter: netlify(),
});
