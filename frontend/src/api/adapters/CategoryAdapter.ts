import { Category } from '@/domain/models'
import { CategoryType, CategoryTypeEnum } from '@/domain/value-objects'

/**
 * DTO from API response
 */
export interface CategoryDTO {
  id: string
  name: string
  icon: string
  type: string
  parentId: string | null
  active: boolean
  createdAt?: string
}

/**
 * DTO for API requests
 */
export interface CategoryCreateDTO {
  name: string
  icon: string
  type: string
  parentId?: string | null
  active?: boolean
}

/**
 * Adapter to convert between API DTOs and domain Category entity
 */
export class CategoryAdapter {
  /**
   * Convert API DTO to domain Category entity
   */
  static toDomain(dto: CategoryDTO): Category {
    try {
      return Category.fromData(
        dto.id,
        dto.name,
        dto.icon,
        dto.type as CategoryTypeEnum,
        dto.parentId || null,
        dto.active ?? true,
        dto.createdAt ? new Date(dto.createdAt) : new Date()
      )
    } catch (error) {
      throw new Error(`Failed to adapt Category DTO to domain: ${error}`)
    }
  }

  /**
   * Convert domain Category entity to API DTO
   */
  static fromDomain(category: Category): CategoryDTO {
    return {
      id: category.getId() || '',
      name: category.getName(),
      icon: category.getIcon(),
      type: category.getType().getValue(),
      parentId: category.getParentId(),
      active: category.isActive(),
      createdAt: category.getCreatedAt().toISOString()
    }
  }

  /**
   * Convert domain Category to create request DTO
   */
  static toCreateDTO(category: Category): CategoryCreateDTO {
    return {
      name: category.getName(),
      icon: category.getIcon(),
      type: category.getType().getValue(),
      parentId: category.getParentId() || null,
      active: category.isActive()
    }
  }

  /**
   * Convert multiple DTOs to domain entities
   */
  static toDomainArray(dtos: CategoryDTO[]): Category[] {
    return dtos.map(dto => this.toDomain(dto))
  }
}
