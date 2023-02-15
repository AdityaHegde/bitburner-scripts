import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import glob from "glob";

const DestFolder = "dist";

const config = [];

glob.sync("scripts/**/*.ts").forEach((file) => {
  config.push({
    input: `${file}`,
    output: {
      dir: DestFolder,
      format: "es",
      inlineDynamicImports: true,
    },
    plugins: [typescript(), nodeResolve()],
    onwarn: (warning, warn) => {
      // suppress eval warnings
      if (warning.code === "EVAL") return;
      warn(warning);
    },
  });
});

export default config;
