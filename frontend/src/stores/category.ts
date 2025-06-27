import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoryApi, type Category, type CategoryCreate } from '@/api/category'

function generateTempId() {
  // Generate a temporary id for optimistic update (e.g., negative timestamp)
  return 'temp-' + Date.now().toString()
}

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
    } catch (e: any) {
      //error.value = `${e.message || 'Failed to fetch categories.'} API URL: ${apiUrl}`
      error.value = `\nPlease check if the backend is running at ${import.meta.env.VITE_API_URL}`
      // console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function createCategory(category: CategoryCreate) {
    const tempId = generateTempId()
    const tempCategory: Category = {
      id: tempId,
      name: category.name,
      icon: category.icon,
      type: category.type,
      parentId: category.parentId ?? null
    }
    // Optimistically add the category
    categories.value.push(tempCategory)
    try {
      loading.value = true
      error.value = null
      const newCategory = await categoryApi.create(category)
      // Replace temp category with real one
      const index = categories.value.findIndex(c => c.id === tempId)
      if (index !== -1) {
        categories.value[index] = newCategory
      }
      return newCategory
    } catch (e) {
      // Rollback: remove temp category
      categories.value = categories.value.filter(c => c.id !== tempId)
      error.value = 'Failed to create category'
      // console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(id: string, category: CategoryCreate) {
    const index = categories.value.findIndex(c => c.id === id)
    if (index === -1) {
      error.value = 'Category not found'
      throw new Error('Category not found')
    }
    const oldCategory = { ...categories.value[index] }
    // Optimistically update the category
    categories.value[index] = {
      ...oldCategory,
      name: category.name,
      icon: category.icon,
      type: category.type,
      parentId: category.parentId ?? null
    }
    try {
      loading.value = true
      error.value = null
      const updatedCategory = await categoryApi.update(id, category)
      categories.value[index] = updatedCategory
      return updatedCategory
    } catch (e) {
      // Rollback to old category
      categories.value[index] = oldCategory
      error.value = 'Failed to update category'
      // console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function getCategoryById(id: string): Category | undefined {
    return categories.value.find(c => c.id === id)
  }

  async function deleteCategory(id: string) {
    const index = categories.value.findIndex(c => c.id === id)
    if (index === -1) {
      error.value = 'Category not found'
      throw new Error('Category not found')
    }
    // Optimistically remove the category
    const removedCategory = categories.value[index]
    categories.value.splice(index, 1)
    try {
      loading.value = true
      error.value = null
      await categoryApi.delete(id)
    } catch (e) {
      // Rollback: add the category back
      categories.value.splice(index, 0, removedCategory)
      error.value = 'Failed to delete category'
      throw e
    } finally {
      loading.value = false
    }
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
    getCategoryById,
    deleteCategory
  }
})
