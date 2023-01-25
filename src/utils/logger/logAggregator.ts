import { LogAggregationPort, PortWrapper } from "$src/ports/portWrapper";
import type { NetscriptPort, NS } from "$src/types/gameTypes";
import { LogAppender } from "$src/utils/logger/logAppender";
import type { JsonLog } from "$src/utils/logger/logFormatter";

export class LogAggregator {
  private ws = new WebSocket("ws://localhost:3002");
  private portWrapper: PortWrapper;

  private logs: Array<JsonLog> = [];

  public constructor(private readonly ns: NS) {
    this.portWrapper = new PortWrapper(ns, LogAggregationPort);
  }

  public async run() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      while (!this.portWrapper.empty()) {
        this.logs.push((await this.portWrapper.read(true)) as any);
      }
      this.ws.send(JSON.stringify(this.logs));
      await this.ns.sleep(100);
    }
  }
}

export class LogAggregationAppender extends LogAppender {
  private portHandle: NetscriptPort;

  public constructor(private readonly ns: NS) {
    super();
    this.portHandle = ns.getPortHandle(LogAggregationPort);
  }

  public append(message: string): void {
    this.portHandle.write(message);
  }

  public flush(): void {
    // nothing
  }
}
