import type { NS } from "$src/types/gameTypes";
import { LogAggregationAppender } from "$src/utils/logger/logAggregator";
import { ConsoleLogAppender, FileLogAppender, LogAppender } from "$src/utils/logger/logAppender";
import {
  ConsoleLogFormatter,
  JsonLogFormatter,
  LogFormatter,
} from "$src/utils/logger/logFormatter";
import { LogFile, LogLevel } from "$src/utils/logger/loggerConstants";

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

  public static AggregatorLogger(ns: NS, label: string): Logger {
    return new Logger(ns, label, new LogAggregationAppender(ns), new JsonLogFormatter());
  }

  public start(): void {
    this.log("Started");
  }

  public log<Fields = Record<string, any>>(message: string, fields?: Fields, level?: number): void {
    fields ??= {} as any;
    this.appender.append(
      this.formatter.format(this.label, level ?? LogLevel.Debug, message, fields),
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
