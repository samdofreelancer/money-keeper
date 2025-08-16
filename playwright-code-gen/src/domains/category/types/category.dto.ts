export interface CategoryDto {
  id?: string;
  name: string;
  icon: string;
  type: 'Expense' | 'Income';
  parentId?: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  type: 'Expense' | 'Income';
  parentId?: string | null;
}

export interface CategoryResponse {
  id: string;
  name: string;
  icon: string;
  type: 'Expense' | 'Income';
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}
