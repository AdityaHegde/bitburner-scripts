import type { NS } from "$src/types/gameTypes";
import { Colors, LogLevelToColor } from "$src/utils/logger/loggerConstants";

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
      LogLevelToColor[level] + "[%s] %s%s" + Colors.default + "\n",
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
