import { NS } from "../types/gameTypes";

const LogFile = "out.txt";

export class Logger {
  public constructor(private readonly label: string) {}

  public async started(ns: NS): Promise<void> {
    this.log(ns, "Started");
    await ns.sleep(100);
  }

  public log(ns: NS, message: string, fields?: Record<string, any>): void {
    fields ??= {};
    ns.write(
      LogFile,
      JSON.stringify({
        label: this.label,
        message,
        fields: fields,
      }) + "\n",
      "a"
    );
  }

  public ended(ns: NS): void {
    this.log(ns, "Ended");
  }
}
