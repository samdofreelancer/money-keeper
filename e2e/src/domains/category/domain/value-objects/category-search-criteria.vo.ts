import { CategoryType } from "../models/category.model";

/**
 * Value Object for Category Search Criteria
 * Encapsulates search and filtering logic for categories
 */

export interface CategorySearchData {
  searchTerm?: string;
  categoryType?: CategoryType;
  parentId?: string;
}

export class CategorySearchValue {
  constructor(private readonly criteria: CategorySearchData = {}) {}

  get searchTerm(): string | undefined {
    return this.criteria.searchTerm;
  }

  get categoryType(): CategoryType | undefined {
    return this.criteria.categoryType;
  }

  get parentId(): string | undefined {
    return this.criteria.parentId;
  }

  hasSearchTerm(): boolean {
    return (
      !!this.criteria.searchTerm && this.criteria.searchTerm.trim().length > 0
    );
  }

  hasTypeFilter(): boolean {
    return !!this.criteria.categoryType;
  }

  hasParentFilter(): boolean {
    return !!this.criteria.parentId;
  }

  isEmpty(): boolean {
    return (
      !this.hasSearchTerm() && !this.hasTypeFilter() && !this.hasParentFilter()
    );
  }

  matches(
    categoryName: string,
    categoryType: CategoryType,
    parentId?: string
  ): boolean {
    // Check search term
    if (this.hasSearchTerm()) {
      const searchTerm = this.searchTerm!.toLowerCase();
      if (!categoryName.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }

    // Check type filter
    if (this.hasTypeFilter()) {
      if (categoryType !== this.categoryType) {
        return false;
      }
    }

    // Check parent filter
    if (this.hasParentFilter()) {
      if (parentId !== this.parentId) {
        return false;
      }
    }

    return true;
  }

  toQueryString(): string {
    const params = new URLSearchParams();

    if (this.hasSearchTerm()) {
      params.append("search", this.searchTerm!);
    }

    if (this.hasTypeFilter()) {
      params.append("type", this.categoryType!);
    }

    if (this.hasParentFilter()) {
      params.append("parentId", this.parentId!);
    }

    return params.toString();
  }
}
