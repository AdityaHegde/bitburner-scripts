import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import("vite").UserConfig} */
const config = {
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: "web",
    },
  },
  test: {
    include: ["**/*.spec.ts"],
  },
};

export default config;
