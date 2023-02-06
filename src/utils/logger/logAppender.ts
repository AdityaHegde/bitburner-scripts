import type { NS } from "$src/types/gameTypes";

export abstract class LogAppender {
  public abstract append(message: string): void;

  public abstract flush(): void;
}

export class ConsoleLogAppender extends LogAppender {
  public constructor(private readonly ns: NS) {
    super();
    ns.disableLog("ALL");
  }

  public append(message: string): void {
    this.ns.printf(message);
  }

  public flush(): void {
    // no-op
  }
}

export class FileLogAppender extends LogAppender {
  private messages = "";

  public constructor(private readonly ns: NS, private readonly file: string) {
    super();
    // create fresh file
    this.ns.write(this.file, "", "w");
  }

  public append(message: string): void {
    this.messages += message;
  }

  public flush(): void {
    this.ns.write(this.file, this.messages, "a");
    this.messages = "";
  }
}
