import type { GameStateCollector } from "$server/game/gameState";
import type { Patch } from "immer";
import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";

export class StatsSocketServer {
  private readonly wss: WebSocketServer;
  private ws: WebSocket;

  public constructor(private readonly gameStatsCollector: GameStateCollector) {
    this.wss = new WebSocketServer({
      port: 3002,
    });
    this.wss.on("listening", () => console.log("Web socket started on 3002"));
    this.wss.on("connection", (ws) => {
      this.ws = ws;
      ws.send(
        JSON.stringify({
          type: "initData",
          data: this.gameStatsCollector.state,
        }),
      );
      ws.send(
        JSON.stringify({
          type: "initHackEntries",
          data: this.gameStatsCollector.hackEntries,
        }),
      );
      ws.on("close", () => {
        this.ws = undefined;
      });
    });
  }

  public sendPatches(patches: Array<Patch>) {
    if (!this.ws) return;
    this.ws.send(JSON.stringify({ type: "gameDataPatches", data: patches }));
  }

  public sendHackEntriesPatches(patches: Array<Patch>) {
    if (!this.ws || !patches?.length) return;
    this.ws.send(JSON.stringify({ type: "hackEntriesPatches", data: patches }));
  }
}
