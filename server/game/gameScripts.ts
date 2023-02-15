import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gameClient } from "$server/jsonrpc/game-client";

export class GameScripts {
  private lastChecked = 0;

  public constructor(private readonly dir: string) {}

  public async run() {
    const files = await readdir(this.dir);
    for (const file of files) {
      const fullPath = path.join(this.dir, file);
      const fileStat = await stat(fullPath);
      if (!fileStat.isFile() || fileStat.ctime.getTime() < this.lastChecked) continue;

      const content = (await readFile(fullPath)).toString();
      await gameClient.pushFile({
        filename: file,
        server: "home",
        content,
      });
    }
    this.lastChecked = Date.now();
  }
}
