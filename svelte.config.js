import adapter from "@sveltejs/adapter-static";
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
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: null,
      precompress: true,
      strict: true,
    }),
    files: {
      assets: "web/static",
      routes: "web/routes",
      lib: "web/lib",
      appTemplate: "web/app.html",
    },
    alias: {
      $src: resolve("./src"),
      $lib: resolve("./web/lib"),
      $components: resolve("./web/lib/components"),
      $server: resolve("./server"),
    },
  },
};

export default config;
