import { Transient, TOKENS } from 'shared/di';

// src/domains/category/usecases/api/CategoryDeletionApiUseCase.ts
export interface CategoryDeletionApiUseCase {
  deleteCategory(categoryId: string): Promise<void>;
}

@Transient({ token: TOKENS.CategoryDeletionApiUseCase })
export class CategoryDeletionApiUseCaseImpl
  implements CategoryDeletionApiUseCase
{
  constructor(
    private readonly baseUrl: string,
    private readonly token?: string
  ) {}

  async deleteCategory(categoryId: string): Promise<void> {
    const url = `${this.baseUrl}/api/categories/${encodeURIComponent(categoryId)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(
        `Delete category failed: ${res.status} ${res.statusText}\n${body}`
      );
    }
  }
}
