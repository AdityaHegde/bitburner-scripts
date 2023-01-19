import { HackPortStart } from "$src/ports/portWrapper";

export class PortPool {
  private static instance = new PortPool();
  private pool = new Array<number>();

  private constructor(private maxPort = HackPortStart) {}

  public static acquire(): number {
    if (this.instance.pool.length > 0) return this.instance.pool.shift();
    return this.instance.maxPort++;
  }

  public static release(port: number) {
    this.instance.pool.push(port);
  }
}
