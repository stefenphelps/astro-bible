import { defineConfig } from "astro/config";
import AstroPWA from "@vite-pwa/astro";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";
import netlify from "@astrojs/netlify/functions";
import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
	site: "https://astro-bible.netlify.app",
	trailingSlash: "always",
	output: "server",
	integrations: [
		compress(),
		sitemap(),
		prefetch(),
		AstroPWA({
			manifest: {
				base: "/",
				scope: "/",
				orientation: "portrait-primary",
				name: "The Simple Bible",
				short_name: "Bible",
				description: "A well designed simple Bible app powered by Astro.",
				start_url: "https://astro-bible.netlify.app",
				theme_color: "#fff7ed",
				background_color: "#fff7ed",
				display: "standalone",
				includeAssets: ["*.{png,ico,svg,jpg,xml}"],
				icons: [
					{
						src: "/pwa-192x192.png",
						sizes: "192x192",
						type: "image/png"
					},
					{
						src: "/safari-pinned-tab.svg",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable"
					},
					{
						src: "/pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any"
					}
				]
			},
			workbox: {
				navigateFallback: "/404",
				globPatterns: ["**/*.{css,js,html,svg,png,ico,txt}"]
			}
		})
	],
	adapter: netlify()
});
