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
      ws.on("message", (data) => {
        const dataStr = data.toString();
        if (dataStr === "UI") {
          this.ws = ws;
          this.sendUIData();
          return;
        }

        this.sendHackEntriesPatches(gameStatsCollector.addLogs(JSON.parse(data.toString())));
      });
    });
  }

  private sendUIData() {
    this.ws.send(
      JSON.stringify({
        type: "initData",
        data: this.gameStatsCollector.state,
      }),
    );
    this.ws.send(
      JSON.stringify({
        type: "initHackEntries",
        data: this.gameStatsCollector.hackEntries,
      }),
    );
  }

  private sendPatches(patches: Array<Patch>) {
    if (!this.ws || !patches?.length) return;
    this.ws.send(JSON.stringify({ type: "gameDataPatches", data: patches }));
  }

  private sendHackEntriesPatches(patches: Array<Patch>) {
    if (!this.ws || !patches?.length) return;
    this.ws.send(JSON.stringify({ type: "hackEntriesPatches", data: patches }));
  }
}
