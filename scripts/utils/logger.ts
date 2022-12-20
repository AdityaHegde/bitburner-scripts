import type { NS } from "../types/gameTypes";

export class Logger {
  public constructor(private readonly ns: NS, private readonly label: string) {
    ns.disableLog("ALL");
  }

  public log(message: string, fields: Record<string, any> = {}): void {
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
    this.ns.printf("[%s] %s%s\n", this.label, message, fieldsStrings);
  }
}
