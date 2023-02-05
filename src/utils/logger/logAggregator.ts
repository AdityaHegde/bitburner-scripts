import type { NS } from "$src/types/gameTypes";
import { LogAppender } from "$src/utils/logger/logAppender";

export const LogsSize = 5;

export class LogAggregationAppender extends LogAppender {
  private logs = new Array<string>();
  private readonly ws: WebSocket;

  public constructor(private readonly ns: NS) {
    super();
    this.ws = eval("window").ws;
    if (!this.ws) {
      eval("window").ws = this.ws = new WebSocket("ws://localhost:3002");
    }
  }

  public append(message: string): void {
    this.logs.push(message);
    if (this.logs.length < LogsSize || this.ws.readyState !== 1) return;
    this.ws.send(`[${this.logs.join(",")}]`);
    this.logs = [];
  }

  public flush(): void {
    // nothing
  }
}
