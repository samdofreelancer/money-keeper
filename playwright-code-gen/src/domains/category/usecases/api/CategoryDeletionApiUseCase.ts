// src/domains/category/usecases/api/CategoryDeletionApiUseCase.ts
export interface CategoryDeletionApiUseCase {
  deleteCategory(name: string): Promise<void>;
}

export class CategoryDeletionApiUseCaseImpl implements CategoryDeletionApiUseCase {
  constructor(private readonly baseUrl: string, private readonly token?: string) {}

  async deleteCategory(name: string): Promise<void> {
    const url = `${this.baseUrl}/api/categories?name=${encodeURIComponent(name)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Delete category failed: ${res.status} ${res.statusText}\n${body}`);
    }
  }
}
