import { DomainEvent } from "./DomainEvent";

type Handler<T extends DomainEvent> = (event: T) => Promise<void>;

export class EventDispatcher {
  private static handlers: Map<string, Handler<any>[]> = new Map();

  static register<T extends DomainEvent>(
    eventName: string,
    handler: Handler<T>
  ): void {
    const existing = EventDispatcher.handlers.get(eventName) ?? [];
    EventDispatcher.handlers.set(eventName, [...existing, handler]);
  }

  static async dispatch<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = EventDispatcher.handlers.get(event.eventName) ?? [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }

  static clear(): void {
    EventDispatcher.handlers.clear();
  }
}
