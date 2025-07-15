import { DomainEvent } from "./events";

/**
 * Interface for publishing domain events
 */
export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}

/**
 * Simple in-memory event publisher for testing
 */
export class InMemoryEventPublisher implements EventPublisher {
  private events: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.events.push(event);
    console.log(`Event published: ${event.type}`, event.payload);
  }

  getEvents(): DomainEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}
