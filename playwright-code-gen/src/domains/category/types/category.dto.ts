import { CategoryType } from './category-type';

export interface CategoryDto {
  id?: string;
  name: string;
  icon: string;
  type: CategoryType;
  parentId?: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  type: CategoryType;
  parentId?: string | null;
}

export interface CategoryResponse {
  id: string;
  name: string;
  icon: string;
  type: CategoryType;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}
