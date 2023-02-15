type VoidType = void | Promise<void>;
type ListenerFunction = (...args: Array<any>) => VoidType;
export type FunctionArgs<T> = T extends (...args: infer R) => VoidType ? R : any;
type EventsType = {
  [event: string]: ListenerFunction;
};

export class EventEmitter<Events extends EventsType> {
  private readonly listeners = new Map<keyof Events, Array<ListenerFunction>>();

  public on<E extends keyof Events>(event: E, listener: Events[E]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }

  public off<E extends keyof Events>(event: E, listener: Events[E]) {
    if (!this.listeners.has(event)) return;
    this.listeners.set(
      event,
      this.listeners.get(event).filter((l) => l === listener),
    );
  }

  public emit<E extends keyof Events>(event: E, ...args: FunctionArgs<Events[E]>) {
    if (!this.listeners.has(event)) return;
    for (const listener of this.listeners.get(event)) {
      listener(...args);
    }
  }

  public clearListeners() {
    this.listeners.clear();
  }
}
