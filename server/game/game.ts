import { GameLogs } from "$server/game/gameLogs";
import { GameScripts } from "$server/game/gameScripts";
import { GameStateCollector } from "$server/game/gameState";
import { gameClient } from "$server/jsonrpc/game-client";
import { StatsSocketServer } from "$server/statsSocketServer";
import { asyncWait } from "$server/utils/asyncUtils";
import type { Metadata } from "$src/metadata/metadata";

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
    }
  }
}
