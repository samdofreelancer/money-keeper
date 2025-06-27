import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080/api";

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: "INCOME" | "EXPENSE";
  parentId: string | null;
}

export async function createCategory(
  category: Omit<Category, "id">
): Promise<Category> {
  try {
    const response = await axios.post<Category>(
      `${API_BASE_URL}/categories`,
      category
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to create category: ${
          error.response?.data?.message || error.message
        }`
      );
    }
    throw error;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await axios.get<Category[]>(`${API_BASE_URL}/categories`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch categories: ${
          error.response?.data?.message || error.message
        }`
      );
    }
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/categories/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to delete category ${id}: ${
          error.response?.data?.message || error.message
        }`
      );
    }
    throw error;
  }
}
