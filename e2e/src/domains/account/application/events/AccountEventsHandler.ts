import {
  DomainEvent,
  AccountCreatedEvent,
  AccountCreationFailedEvent,
} from "../../../../shared/domain/events";
import { logger } from "../../../../shared/utils/logger";

export function handleAccountEvent(event: DomainEvent): void {
  switch (event.type) {
    case "AccountCreated": {
      const createdEvent = event as AccountCreatedEvent;
      logger.info(
        `Account created: ${createdEvent.payload.accountName} (ID: ${
          createdEvent.payload.accountId ?? "N/A"
        })`
      );
      // Add notification or other side effects here
      break;
    }

    case "AccountCreationFailed": {
      const failedEvent = event as AccountCreationFailedEvent;
      logger.warn(
        `Account creation failed for ${failedEvent.payload.accountName}: ${failedEvent.payload.error}`
      );
      // Add notification or other side effects here
      break;
    }

    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }
}
