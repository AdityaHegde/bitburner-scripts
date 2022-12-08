import typescript from "@rollup/plugin-typescript";
import glob from "glob";

const DestFolder = "dist";

const config = [];

glob.sync("src/**/scripts/*.ts").forEach((file) => {
  config.push({
    input: `${file}`,
    output: {
      dir: DestFolder,
      format: "es",
    },
    plugins: [typescript()],
  });
});

export default config;
