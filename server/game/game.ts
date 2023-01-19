import { GameLogs } from "$server/game/gameLogs";
import { GameScripts } from "$server/game/gameScripts";
import { GameStateCollector } from "$server/game/gameState";
import { gameClient } from "$server/jsonrpc/game-client";
import { StatsSocketServer } from "$server/statsSocketServer";
import { asyncWait } from "$server/utils/asyncUtils";
import { MetadataFile } from "$src/constants";
import type { Metadata } from "$src/metadata/metadata";
import type { HackEntryLog } from "$src/servers/hack/wrapAction";
import { HackBegMessage, HackEndMessage } from "$src/servers/hack/wrapAction";
import { HackFile, ServersLogFile } from "$src/utils/logger";

export class Game {
  private metadata?: Metadata;
  private readonly gameScripts = new GameScripts("dist");
  private readonly gameLogs = new GameLogs();
  private readonly gameStateCollector = new GameStateCollector();
  private readonly statsSocketServer = new StatsSocketServer(this.gameStateCollector);

  public async run() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await asyncWait(1000);
      if (!gameClient.isConnected()) continue;

      await this.gameScripts.run();

      await this.readMetadata();
      if (!this.metadata) continue;

      const logs = await this.gameLogs.read(this.metadata.runnerServer, ServersLogFile);
      if (logs.length === 0) continue;

      this.statsSocketServer.sendHackEntriesPatches(
        this.gameStateCollector.updateHackEntries(await this.readHackPoints()),
      );
      const [patches] = this.gameStateCollector.sortLogs(logs);
      this.statsSocketServer.sendPatches(patches);
    }
  }

  private async readMetadata() {
    try {
      this.metadata = JSON.parse(
        await gameClient.getFile({
          filename: MetadataFile,
          server: "home",
        }),
      );
    } catch (err) {
      this.metadata = undefined;
    }
  }

  private async readHackPoints(): Promise<Array<HackEntryLog>> {
    const hackEntryLogs = new Array<HackEntryLog>();

    for (const resourceServer in this.gameStateCollector.state.resources) {
      const logs = await this.gameLogs.read(resourceServer, HackFile);
      if (logs.length === 0) continue;
      hackEntryLogs.push(
        ...logs
          .filter((log) => {
            if (log.message !== HackBegMessage && log.message !== HackEndMessage) return false;
            log.fields.time = log.timestamp;
            log.fields.server = resourceServer;
            return true;
          })
          .map((log) => log.fields as HackEntryLog),
      );
    }

    return hackEntryLogs;
  }
}
