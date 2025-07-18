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
  parentId?: string | null
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request and response interceptors for logging
api.interceptors.request.use(request => {
  console.log('Starting Request', request.method, request.url);
  return request;
});

api.interceptors.response.use(response => {
  console.log('Response:', response.status, response.config.url);
  return response;
}, error => {
  console.error('Response error:', error.response?.status, error.response?.config?.url, error.message);
  return Promise.reject(error);
});

function convertParentId(parentId?: string | null): number | null | undefined {
  if (parentId === undefined) return undefined
  if (parentId === null || parentId === 'null') return null
  const num = Number(parentId)
  return isNaN(num) ? null : num
}

export const categoryApi = {
  async getAll(): Promise<Category[]> {
    const response = await api.get('/categories')
    return response.data
  },

  async create(category: CategoryCreate): Promise<Category> {
    // Convert parentId to number or null before sending
    const payload = {
      ...category,
      parentId: convertParentId(category.parentId)
    }
    const response = await api.post('/categories', payload)
    return response.data
  },

  async update(id: string, category: CategoryCreate): Promise<Category> {
    const payload = {
      ...category,
      parentId: convertParentId(category.parentId)
    }
    const response = await api.put(`/categories/${id}`, payload)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  }
}
