import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import glob from "glob";
import path from "node:path";

const DestFolder = "dist";

const config = [];

glob.sync("scripts/**/*.ts").forEach((file) => {
  const dir = path.dirname(file).replace(/scripts\/?/, "");
  config.push({
    input: `${file}`,
    output: {
      dir: DestFolder + (dir ? "/" + dir : ""),
      format: "es",
      inlineDynamicImports: true,
    },
    plugins: [typescript({ sourceMap: false }), nodeResolve()],
    onwarn: (warning, warn) => {
      // suppress eval warnings
      if (warning.code === "EVAL") return;
      warn(warning);
    },
  });
});

export default config;
