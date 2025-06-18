import axios from 'axios'

export interface Category {
  id: string
  name: string
  icon: string
  type: string
  parentId: string | null
}

export interface CategoryCreate {
  name: string
  icon: string
  type: string
  parentId?: string
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const categoryApi = {
  async getAll(): Promise<Category[]> {
    const response = await api.get('/categories')
    return response.data
  },

  async create(category: CategoryCreate): Promise<Category> {
    const response = await api.post('/categories', category)
    return response.data
  },

  async update(id: string, category: CategoryCreate): Promise<Category> {
    const response = await api.put(`/categories/${id}`, category)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  }
}
