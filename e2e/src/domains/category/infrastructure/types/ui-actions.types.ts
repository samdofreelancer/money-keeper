/**
 * Type definitions for UI Actions
 * These types bridge the gap between domain models and UI interactions
 */

export interface CategoryFormUIData {
  name: string;
  icon: string;
  type: string;
  parentCategory?: string;
}

export interface CategoryUIElement {
  name: string;
  selector: string;
  timeout?: number;
}
