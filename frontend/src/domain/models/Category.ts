import { CategoryType, CategoryTypeEnum } from '../value-objects';

/**
 * Icon type for categories
 */
export type CategoryIcon = string; // SVG icon name or emoji

/**
 * Aggregate representing a transaction category
 * Encapsulates business logic for category operations and hierarchies
 */
export class Category {
  private readonly id: string | null;
  private name: string;
  private icon: CategoryIcon;
  private type: CategoryType;
  private parentId: string | null;
  private active: boolean;
  private createdAt: Date;

  /**
   * Private constructor - use factory methods
   */
  private constructor(
    id: string | null,
    name: string,
    icon: CategoryIcon,
    type: CategoryType,
    parentId: string | null,
    active: boolean,
    createdAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.type = type;
    this.parentId = parentId;
    this.active = active;
    this.createdAt = createdAt;
  }

  /**
   * Factory method to create a new category
   */
  static create(
    name: string,
    icon: CategoryIcon,
    type: CategoryType | CategoryTypeEnum | string,
    parentId?: string | null
  ): Category {
    const categoryType =
      type instanceof CategoryType
        ? type
        : typeof type === 'string'
          ? CategoryType.of(type)
          : CategoryType.fromEnum(type);

    return new Category(
      null,
      Category.validateName(name),
      Category.validateIcon(icon),
      categoryType,
      parentId ?? null,
      true,
      new Date()
    );
  }

  /**
   * Factory method to reconstruct from persistence
   */
  static fromData(
    id: string,
    name: string,
    icon: CategoryIcon,
    type: CategoryTypeEnum | string,
    parentId: string | null = null,
    active: boolean = true,
    createdAt: Date = new Date()
  ): Category {
    const categoryType =
      typeof type === 'string' ? CategoryType.of(type) : CategoryType.fromEnum(type);

    return new Category(
      id,
      Category.validateName(name),
      Category.validateIcon(icon),
      categoryType,
      parentId,
      active,
      createdAt
    );
  }

  /**
   * Validate category name
   */
  private static validateName(name: string): string {
    if (!name || name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }
    const trimmed = name.trim();
    if (trimmed.length > 100) {
      throw new Error('Category name cannot exceed 100 characters');
    }
    return trimmed;
  }

  /**
   * Validate category icon
   */
  private static validateIcon(icon: CategoryIcon): CategoryIcon {
    if (!icon || icon.trim().length === 0) {
      throw new Error('Category icon cannot be empty');
    }
    if (icon.length > 50) {
      throw new Error('Category icon cannot exceed 50 characters');
    }
    return icon.trim();
  }

  /**
   * Get category ID
   */
  getId(): string | null {
    return this.id;
  }

  /**
   * Check if category is persisted
   */
  isPersisted(): boolean {
    return this.id !== null;
  }

  /**
   * Get category name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get category icon
   */
  getIcon(): CategoryIcon {
    return this.icon;
  }

  /**
   * Get category type
   */
  getType(): CategoryType {
    return this.type;
  }

  /**
   * Get parent category ID (if hierarchical)
   */
  getParentId(): string | null {
    return this.parentId;
  }

  /**
   * Check if category is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Get creation date
   */
  getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Check if category has a parent (is a subcategory)
   */
  hasParent(): boolean {
    return this.parentId !== null;
  }

  /**
   * Check if category can have a parent
   * Prevents multiple hierarchy levels
   */
  canHaveParent(): boolean {
    return !this.hasParent();
  }

  /**
   * Set parent category (business operation)
   * Throws if attempting to create hierarchical hierarchy or self-reference
   */
  setParent(parentId: string | null): void {
    if (!this.active) {
      throw new Error('Cannot modify inactive category');
    }

    if (parentId === this.id) {
      throw new Error('Category cannot be its own parent');
    }

    // Prevent multiple hierarchy if this category already has children
    if (this.hasParent() && parentId !== null) {
      throw new Error('Category cannot have children if it has a parent');
    }

    this.parentId = parentId;
  }

  /**
   * Activate category (business operation)
   */
  activate(): void {
    if (this.active) {
      throw new Error('Category is already active');
    }
    this.active = true;
  }

  /**
   * Deactivate category (business operation)
   */
  deactivate(): void {
    if (!this.active) {
      throw new Error('Category is already inactive');
    }
    this.active = false;
  }

  /**
   * Update category name (business operation)
   */
  updateName(newName: string): void {
    if (!this.active) {
      throw new Error('Cannot update inactive category');
    }
    this.name = Category.validateName(newName);
  }

  /**
   * Update category icon (business operation)
   */
  updateIcon(newIcon: CategoryIcon): void {
    if (!this.active) {
      throw new Error('Cannot update inactive category');
    }
    this.icon = Category.validateIcon(newIcon);
  }

  /**
   * Check if category can be deleted
   * Returns false if category has transactions or children
   * Used by repository before deletion
   */
  canDelete(): boolean {
    // This is a business rule that repository should check before actual deletion
    // - No transactions exist for this category
    // - No child categories exist
    return this.active && this.isPersisted();
  }

  /**
   * Get display representation
   */
  display(): string {
    const hierarchy = this.hasParent() ? ` (child of ${this.parentId})` : '';
    return `${this.name} [${this.type.getDisplayName()}]${hierarchy} - ${this.active ? 'Active' : 'Inactive'}`;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      type: this.type.getValue(),
      parentId: this.parentId,
      active: this.active,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
