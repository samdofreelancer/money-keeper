import { Account } from "../entities/Account.entity";

export interface AccountFindOptions {
  limit?: number;
  offset?: number;
  filter?: {
    accountName?: string;
    accountType?: string;
    currency?: string;
  };
}

/**
 * Repository interface for Account aggregate
 * Follows DDD Repository pattern
 */
export interface AccountRepository {
  save(account: Account): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByName(name: string): Promise<Account | null>;
  findAll(options?: AccountFindOptions): Promise<Account[]>;
  delete(id: string): Promise<void>;
}
