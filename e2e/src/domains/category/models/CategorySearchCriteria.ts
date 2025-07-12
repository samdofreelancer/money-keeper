/**
 * Value object for category search criteria
 */

import { CategoryType } from "./Category";

export interface CategorySearchCriteria {
  searchTerm?: string;
  categoryType?: CategoryType;
}

export class CategorySearchValue {
  readonly searchTerm?: string;
  readonly categoryType?: CategoryType;

  constructor(criteria: CategorySearchCriteria) {
    this.searchTerm = criteria.searchTerm;
    this.categoryType = criteria.categoryType;
  }

  /**
   * Checks if search term is provided
   */
  hasSearchTerm(): boolean {
    return !!this.searchTerm && this.searchTerm.trim() !== "";
  }

  /**
   * Checks if category type filter is provided
   */
  hasTypeFilter(): boolean {
    return !!this.categoryType;
  }

  /**
   * Checks if any criteria is provided
   */
  hasAnyCriteria(): boolean {
    return this.hasSearchTerm() || this.hasTypeFilter();
  }

  /**
   * Gets normalized search term
   */
  getNormalizedSearchTerm(): string {
    return this.searchTerm?.trim().toLowerCase() || "";
  }
}
