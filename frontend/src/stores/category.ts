import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoryApi, type Category, type CategoryCreate } from '@/api/category'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const expenseCategories = computed(() => 
    categories.value.filter(c => c.type === 'EXPENSE')
  )

  const incomeCategories = computed(() => 
    categories.value.filter(c => c.type === 'INCOME')
  )

  async function fetchCategories() {
    try {
      loading.value = true
      error.value = null
      categories.value = await categoryApi.getAll()
    } catch (e) {
      error.value = 'Failed to fetch categories'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function createCategory(category: CategoryCreate) {
    try {
      loading.value = true
      error.value = null
      const newCategory = await categoryApi.create(category)
      categories.value.push(newCategory)
      return newCategory
    } catch (e) {
      error.value = 'Failed to create category'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(id: string, category: CategoryCreate) {
    try {
      loading.value = true
      error.value = null
      const updatedCategory = await categoryApi.update(id, category)
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }
      return updatedCategory
    } catch (e) {
      error.value = 'Failed to update category'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function getCategoryById(id: string): Category | undefined {
    return categories.value.find(c => c.id === id)
  }

  return {
    categories,
    expenseCategories,
    incomeCategories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    getCategoryById
  }
})
