import { Account as AccountEntity, AccountTypeEnum } from '@/domain/models'
import { Currency, Money } from '@/domain/value-objects'

/**
 * DTO from API response
 * Matches the backend Account entity structure
 */
export interface AccountDTO {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  active: boolean
}

/**
 * DTO for API requests
 */
export interface AccountCreateDTO {
  accountName: string
  type: string
  initBalance: number
  currency: string
  active?: boolean
}

/**
 * Adapter to convert between API DTOs and domain Account entity
 */
export class AccountAdapter {
  /**
   * Convert API DTO to domain Account entity
   */
  static toDomain(dto: AccountDTO): AccountEntity {
    try {
      const currency = Currency.of(dto.currency || 'USD')
      const money = Money.of(dto.balance || 0, currency)
      
      return AccountEntity.fromData(
        dto.id,
        dto.name,
        dto.type as AccountTypeEnum,
        money,
        dto.active ?? true,
        new Date() // createdAt - not provided by API
      )
    } catch (error) {
      throw new Error(`Failed to adapt Account DTO to domain: ${error}`)
    }
  }

  /**
   * Convert domain Account entity to API DTO
   */
  static fromDomain(account: AccountEntity): AccountDTO {
    return {
      id: account.getId() || '',
      name: account.getName(),
      type: account.getType(),
      balance: account.getInitialBalance().getAmount(),
      currency: account.getInitialBalance().getCurrency().getCode(),
      active: account.isActive()
    }
  }

  /**
   * Convert domain Account to create request DTO
   */
  static toCreateDTO(account: AccountEntity): AccountCreateDTO {
    return {
      accountName: account.getName(),
      type: account.getType(),
      initBalance: account.getInitialBalance().getAmount(),
      currency: account.getInitialBalance().getCurrency().getCode(),
      active: account.isActive()
    }
  }

  /**
   * Convert array of API DTOs to domain Account entities
   */
  static toDomainArray(dtos: AccountDTO[]): AccountEntity[] {
    return dtos.map(dto => this.toDomain(dto))
  }
}
