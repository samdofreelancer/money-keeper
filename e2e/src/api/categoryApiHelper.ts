const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080/api";

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
  parentId: string | null;
}

export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete category ${id}: ${response.statusText}`);
  }
}
