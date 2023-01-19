import { gameClient } from "$server/jsonrpc/game-client";
import type { JsonLog } from "$src/utils/logger";

export class GameLogs {
  public async read(server: string, filename: string): Promise<Array<JsonLog>> {
    let rawLogs: string;
    let logs: Array<JsonLog>;
    try {
      rawLogs = await gameClient.getFile({
        filename,
        server,
      });
      if (!rawLogs) return [];

      logs = rawLogs
        .split("\n")
        .filter((log) => !!log)
        .map((log) => JSON.parse(log));
      if (logs[logs.length - 1].message !== "Ended") return [];

      await gameClient.deleteFile({
        filename,
        server,
      });
    } catch (err) {
      console.error(err);
      return [];
    }

    return logs;
  }
}
