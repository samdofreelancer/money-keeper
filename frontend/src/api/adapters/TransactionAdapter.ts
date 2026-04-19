import { Transaction, TransactionTypeEnum } from '@/domain/models'
import { Money, Currency } from '@/domain/value-objects'

/**
 * DTO from API response
 */
export interface TransactionDTO {
  id: string
  amount: number
  currency: string
  type: string
  categoryId: string
  description: string
  accountId: string
  counterpartyAccountId?: string | null
  date: string
  reversalId?: string | null
  active: boolean
  createdAt?: string
}

/**
 * DTO for API requests
 */
export interface TransactionCreateDTO {
  amount: number
  currency: string
  type: string
  categoryId: string
  description?: string
  accountId: string
  counterpartyAccountId?: string | null
  date?: string
  active?: boolean
}

/**
 * Adapter to convert between API DTOs and domain Transaction entity
 */
export class TransactionAdapter {
  /**
   * Convert API DTO to domain Transaction entity
   */
  static toDomain(dto: TransactionDTO): Transaction {
    try {
      const currency = Currency.of(dto.currency || 'USD')
      const money = Money.of(dto.amount || 0, currency)
      
      return Transaction.fromData(
        dto.id,
        money,
        dto.type as TransactionTypeEnum,
        dto.categoryId,
        dto.accountId,
        dto.description || '',
        dto.counterpartyAccountId || null,
        new Date(dto.date),
        dto.reversalId || null,
        dto.active ?? true,
        dto.createdAt ? new Date(dto.createdAt) : new Date()
      )
    } catch (error) {
      throw new Error(`Failed to adapt Transaction DTO to domain: ${error}`)
    }
  }

  /**
   * Convert domain Transaction entity to API DTO
   */
  static fromDomain(transaction: Transaction): TransactionDTO {
    return {
      id: transaction.getId() || '',
      amount: transaction.getAmount().getAmount(),
      currency: transaction.getAmount().getCurrency().getCode(),
      type: transaction.getType(),
      categoryId: transaction.getCategoryId(),
      description: transaction.getDescription(),
      accountId: transaction.getAccountId(),
      counterpartyAccountId: transaction.getCounterpartyAccountId(),
      date: transaction.getDate().toISOString(),
      reversalId: transaction.getReversalId(),
      active: transaction.isActive(),
      createdAt: transaction.getCreatedAt().toISOString()
    }
  }

  /**
   * Convert domain Transaction to create request DTO
   */
  static toCreateDTO(transaction: Transaction): TransactionCreateDTO {
    return {
      amount: transaction.getAmount().getAmount(),
      currency: transaction.getAmount().getCurrency().getCode(),
      type: transaction.getType(),
      categoryId: transaction.getCategoryId(),
      description: transaction.getDescription() || undefined,
      accountId: transaction.getAccountId(),
      counterpartyAccountId: transaction.getCounterpartyAccountId(),
      date: transaction.getDate().toISOString(),
      active: transaction.isActive()
    }
  }

  /**
   * Convert multiple DTOs to domain entities
   */
  static toDomainArray(dtos: TransactionDTO[]): Transaction[] {
    return dtos.map(dto => this.toDomain(dto))
  }
}
