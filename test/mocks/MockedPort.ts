import type { NetscriptPort, PortData } from "$src/types/gameTypes";

export class MockedPort implements NetscriptPort {
  private data = new Array<string | number>();
  private resolvers = new Array<() => void>();

  clear(): void {
    this.data = [];
  }

  empty(): boolean {
    return this.data.length === 0;
  }

  full(): boolean {
    return false;
  }

  nextWrite(): Promise<void> {
    return new Promise((res) => this.resolvers.push(res));
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
    this.data.push(value);
    while (this.resolvers.length > 0) {
      this.resolvers.pop()();
    }
    return null;
  }
}
