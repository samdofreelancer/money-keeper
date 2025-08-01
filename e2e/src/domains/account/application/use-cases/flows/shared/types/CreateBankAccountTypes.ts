import { DomainEvent } from "../../../../../../../shared/domain/events";
import {
  ValidationError,
  DomainError,
  ConflictError,
} from "../errors/CreateBankAccountErrors";

export interface CreateBankAccountRequest {
  accountName: string;
  accountType: string;
  initialBalance: number;
  currency: string;
  description?: string;
}

export type EventPublisher = (event: DomainEvent) => void;

export type CreateBankAccountResult =
  | { type: "success"; accountId?: string }
  | { type: "validation_error"; error: ValidationError }
  | { type: "domain_error"; error: DomainError }
  | { type: "conflict_error"; error: ConflictError }
  | { type: "unknown_error"; error: Error };

// Re-export errors for convenience
export {
  ValidationError,
  DomainError,
  ConflictError,
} from "../errors/CreateBankAccountErrors";
