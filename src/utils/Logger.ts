import { NS } from "../types/gameTypes";

const LogFile = "out.txt";

export class Logger {
  public constructor(private readonly label: string) {}

  public async started(ns: NS) {
    await this.log(ns, "Started");
    await ns.sleep(1000);
  }

  public async log(ns: NS, message: string) {
    await ns.write(LogFile, `[${this.label}] ${message}\n`, "a");
  }

  public async ended(ns: NS) {
    await this.log(ns, "Ended");
  }
}
