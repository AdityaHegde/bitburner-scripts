import typescript from "@rollup/plugin-typescript";
import { readdirSync } from "node:fs";

const ScriptFolder = "src/scripts";
const ScriptSubFolders = readdirSync(ScriptFolder);

const DestFolder = "dist";

const config = [];

ScriptSubFolders.forEach((scriptSubFolder) => {
  const folderName = `${ScriptFolder}/${scriptSubFolder}`;
  const files = readdirSync(folderName);

  files.forEach((file) => {
    config.push({
      input: `${folderName}/${file}`,
      output: {
        dir: DestFolder,
        format: "es",
      },
      plugins: [typescript()],
    });
  });
});

export default config;
