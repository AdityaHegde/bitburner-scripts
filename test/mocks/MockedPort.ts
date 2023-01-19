import { waitUntil } from "$server/utils/asyncUtils";
import type { NetscriptPort, PortData } from "$src/types/gameTypes";

export class MockedPort implements NetscriptPort {
  private data = new Array<string | number>();

  clear(): void {
    this.data = [];
  }

  empty(): boolean {
    return this.data.length === 0;
  }

  full(): boolean {
    return false;
  }

  async nextWrite(): Promise<void> {
    await waitUntil(() => this.data.length > 0);
  }

  peek(): PortData {
    return this.data[0];
  }

  read(): PortData {
    return this.data.shift();
  }

  tryWrite(value: string | number): boolean {
    return false;
  }

  write(value: string | number): PortData | null {
    return this.data.push(value);
  }
}
