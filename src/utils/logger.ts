import type { NS } from "../types/gameTypes";

export const LogLevel = {
  Error: 0,
  Warn: 1,
  Info: 2,
  Debug: 3,
  Verbose: 5,
};

export const Colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  yellow: "\x1b[33m",
  black: "\x1b[30m",
  white: "\x1b[37m",
  default: "\x1b[0m",
};
export const LogLevelToColor = {
  [LogLevel.Error]: Colors.red,
  [LogLevel.Warn]: Colors.red,
  [LogLevel.Info]: Colors.yellow,
  [LogLevel.Debug]: Colors.default,
  [LogLevel.Verbose]: Colors.default,
};

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

export const LogFile = "log.txt";
export const ServersLogFile = "servers.txt";
export const HackFile = "hack.txt";

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

export abstract class LogFormatter {
  public abstract format(
    label: string,
    level: number,
    message: string,
    fields: Record<string, any>,
  ): string;
}

export class ConsoleLogFormatter extends LogFormatter {
  public constructor(private readonly ns: NS) {
    super();
  }

  public format(
    label: string,
    level: number,
    message: string,
    fields: Record<string, any>,
  ): string {
    let fieldsStrings = "";
    for (const key in fields) {
      const val = fields[key];
      const valType = typeof val;
      if (valType === "object") {
        fieldsStrings += ` ${key}=${JSON.stringify(val)}`;
      } else {
        fieldsStrings += ` ${key}=${val}`;
      }
    }
    return this.ns.sprintf(
      LogLevelToColor[level] + "[%s] %s%s" + Colors.default,
      label,
      message,
      fieldsStrings,
    );
  }
}

export type JsonLog = {
  timestamp: number;
  label: string;
  message: string;
  fields: Record<string, any>;
};

export class JsonLogFormatter extends LogFormatter {
  public format(
    label: string,
    level: number,
    message: string,
    fields: Record<string, any>,
  ): string {
    return JSON.stringify({ timestamp: Date.now(), level, label, message, fields } as JsonLog);
  }
}

export class Logger {
  public constructor(
    private readonly ns: NS,
    private readonly label: string,
    private readonly appender: LogAppender,
    private readonly formatter: LogFormatter,
  ) {}

  public static FileLogger(ns: NS, label: string, file = LogFile): Logger {
    return new Logger(ns, label, new FileLogAppender(ns, file), new JsonLogFormatter());
  }

  public static ConsoleLogger(ns: NS, label: string): Logger {
    return new Logger(ns, label, new ConsoleLogAppender(ns), new ConsoleLogFormatter(ns));
  }

  public start(): void {
    this.log("Started");
  }

  public log<Fields = Record<string, any>>(message: string, fields?: Fields, level?: number): void {
    fields ??= {} as any;
    this.appender.append(
      this.formatter.format(this.label, level ?? LogLevel.Debug, message, fields) + "\n",
    );
  }

  public info<Fields = Record<string, any>>(message: string, fields?: Fields): void {
    this.log(message, fields, LogLevel.Info);
  }

  public error<Fields = Record<string, any>>(message: string, fields?: Fields): void {
    this.log(message, fields, LogLevel.Error);
  }

  public end(): void {
    this.log("Ended");
    this.appender.flush();
  }
}
