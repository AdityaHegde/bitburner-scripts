import { readFile, stat } from "node:fs/promises";
import glob from "glob";
import path from "node:path";
import { gameClient } from "$server/jsonrpc/game-client";

export class GameScripts {
  private lastChecked = 0;

  public constructor(private readonly dir: string) {}

  public async run() {
    const files = glob.sync(`${this.dir}/**/*.js`);
    for (const file of files) {
      const fileStat = await stat(file);
      if (!fileStat.isFile() || fileStat.ctime.getTime() < this.lastChecked) continue;

      const remotePath = file.replace(`${this.dir}/`, "");
      const remoteDir = path.dirname(remotePath);
      const content = (await readFile(file)).toString();
      await gameClient.pushFile({
        filename: (remoteDir === "." ? "" : "/") + remotePath,
        server: "home",
        content,
      });
    }
    this.lastChecked = Date.now();
  }
}
