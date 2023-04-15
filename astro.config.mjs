import { defineConfig } from "astro/config";
import AstroPWA from "@vite-pwa/astro";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";

// https://astro.build/config
export default defineConfig({
	site: "https://astro-bible.netlify.app",
	trailingSlash: "always",
	integrations: [
		sitemap(),
		prefetch(),
		AstroPWA({
			manifest: {
				name: "The Bible",
				short_name: "Bible",
				description: "KJV translation of the Bible powered by Astro.",
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
						src: "/pwa-512x512.png",
						sizes: "512x512",
						type: "image/png"
					},
					{
						src: "/pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable"
					}
				]
			}
		})
	]
});
