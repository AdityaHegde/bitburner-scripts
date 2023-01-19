import type { RawData, WebSocket } from "ws";

export type MethodToRequest = {
  pushFile: {
    filename: string;
    content: string;
    server: string;
  };
  getFile: {
    filename: string;
    server: string;
  };
  deleteFile: {
    filename: string;
    server: string;
  };
  getFileNames: {
    server: string;
  };
  getAllFiles: {
    server: string;
  };
  calculateRam: {
    filename: string;
    server: string;
  };
  getDefinitionFile: undefined;
};

export type MethodToResponse = {
  pushFile: "OK";
  getFile: string;
  deleteFile: "OK";
  getFileNames: Array<string>;
  getAllFiles: Array<{
    filename: string;
    content: string;
  }>;
  calculateRam: number;
  getDefinitionFile: string;
};

export class GameClient {
  private id = 0;
  private ws?: WebSocket;
  private resolveMap = new Map<number, (data: unknown) => void>();

  public setSocket(ws: WebSocket | undefined) {
    this.ws = ws;
    this.id = 0;
    this.resolveMap = new Map();
    this.ws?.on("message", (data) => {
      this.haveDataFromSocket(data);
    });
  }

  public isConnected(): boolean {
    return this.ws !== undefined;
  }

  public async pushFile(req: MethodToRequest["pushFile"]): Promise<MethodToResponse["pushFile"]> {
    return this.request("pushFile", req);
  }

  public async getFile(req: MethodToRequest["getFile"]): Promise<MethodToResponse["getFile"]> {
    return this.request("getFile", req);
  }

  public async deleteFile(
    req: MethodToRequest["deleteFile"],
  ): Promise<MethodToResponse["deleteFile"]> {
    return this.request("deleteFile", req);
  }

  public async getFileNames(
    req: MethodToRequest["getFileNames"],
  ): Promise<MethodToResponse["getFileNames"]> {
    return this.request("getFileNames", req);
  }

  public async getAllFiles(
    req: MethodToRequest["getAllFiles"],
  ): Promise<MethodToResponse["getAllFiles"]> {
    return this.request("getAllFiles", req);
  }

  public async calculateRam(
    req: MethodToRequest["calculateRam"],
  ): Promise<MethodToResponse["calculateRam"]> {
    return this.request("calculateRam", req);
  }

  private async request<Method extends keyof MethodToRequest>(
    method: Method,
    req: MethodToRequest[Method],
  ): Promise<MethodToResponse[Method]> {
    if (!this.ws) throw new Error("Not connected");
    return new Promise((resolve, reject) => {
      setTimeout(reject, 30000);
      const id = this.sendToSocket(method, req);
      this.resolveMap.set(id, resolve);
    });
  }

  private sendToSocket<Method extends keyof MethodToRequest>(
    method: Method,
    req: MethodToRequest[Method],
  ): number {
    this.id++;
    const jsonRPCReq = {
      jsonrpc: "2.0",
      id: this.id,
      method,
      params: req,
    };
    this.ws?.send(JSON.stringify(jsonRPCReq));
    return jsonRPCReq.id;
  }

  private haveDataFromSocket(data: RawData) {
    try {
      const json = JSON.parse(data.toString());
      this.resolveMap.get(json.id)?.(json.result);
      this.resolveMap.delete(json.id);
    } catch (err) {
      console.error(err);
    }
  }
}

export const gameClient = new GameClient();
