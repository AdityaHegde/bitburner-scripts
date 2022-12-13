import adapter from "@sveltejs/adapter-auto";
import preprocess from "svelte-preprocess";
import { resolve } from "node:path";

/** @type {import("@sveltejs/kit").Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],

  kit: {
    adapter: adapter(),
    files: {
      assets: "web/static",
      routes: "web/routes",
      lib: "web/lib",
      appTemplate: "web/app.html",
    },
    alias: {
      $lib: resolve("./web/lib"),
      $components: resolve("./web/lib/components"),
      $scripts: resolve("./scripts"),
    },
  },
};

export default config;
