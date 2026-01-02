/**
 * Global Event Bus
 *
 * Provides decoupled pub/sub communication between game systems.
 * Implements IEventBus interface from src/types/interfaces.ts
 */

import type { IEventBus } from '../types/interfaces';

export type EventHandler = (...args: unknown[]) => void;

class EventBusImpl implements IEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * Subscribe to an event
   */
  public on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  /**
   * Unsubscribe from an event
   */
  public off(event: string, handler: EventHandler): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.delete(handler);
      if (eventHandlers.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  /**
   * Emit an event with optional data
   */
  public emit(event: string, data?: unknown): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      for (const handler of eventHandlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      }
    }
  }

  /**
   * Subscribe to an event, automatically unsubscribe after first call
   */
  public once(event: string, handler: EventHandler): void {
    const onceHandler: EventHandler = (...args) => {
      this.off(event, onceHandler);
      handler(...args);
    };
    this.on(event, onceHandler);
  }

  /**
   * Remove all handlers for a specific event or all events
   */
  public clear(event?: string): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }

  /**
   * Check if an event has any subscribers
   */
  public hasListeners(event: string): boolean {
    const eventHandlers = this.handlers.get(event);
    return eventHandlers !== undefined && eventHandlers.size > 0;
  }
}

// Singleton instance for global access
export const EventBus = new EventBusImpl();

export default EventBus;
