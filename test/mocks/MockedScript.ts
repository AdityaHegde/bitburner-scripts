import type { ProcessInfo } from "$src/types/gameTypes";
import { main as grow } from "../../scripts/grow";
import { main as hack } from "../../scripts/hack";
import { main as weaken } from "../../scripts/weaken";
import type { NSMock } from "./NSMock";

const scripts = {
  grow,
  weaken,
  hack,
};

export class MockedScript implements ProcessInfo {
  private static pid = 0;
  pid: number;

  public constructor(
    public filename: string,
    public args: (string | number | boolean)[],
    public server: string,
    public threads: number,
  ) {
    this.pid = MockedScript.pid++;
  }

  public start(ns: NSMock) {
    const newNs = ns.copy();
    newNs.args = this.args;
    newNs.server = this.server;
    newNs.threads = this.threads;
    scripts[this.filename.replace(".js", "")](newNs);
  }
}
