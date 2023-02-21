import type { NS } from "$src/types/gameTypes";

export class ScriptSchedule {
  public readonly mem: number;

  public constructor(
    ns: NS,
    public readonly script: string,
    public args: Array<any>,
    public readonly score: number,
    public readonly extraScripts = new Array<string>(),
  ) {
    this.mem = ns.getScriptRam(script, "home");
  }
}
