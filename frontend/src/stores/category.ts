import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoryApi, type CategoryCreate } from '@/api/category'
import { CategoryAdapter } from '@/api/adapters'
import { Category, CategoryTypeEnum } from '@/domain/models'
import { CategoryType } from '@/domain/value-objects'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const expenseCategories = computed(() => 
    categories.value.filter(c => c.getType().isExpense())
  )

  const incomeCategories = computed(() => 
    categories.value.filter(c => c.getType().isIncome())
  )

  const transferCategories = computed(() =>
    categories.value.filter(c => c.getType().isTransfer())
  )

  async function fetchCategories() {
    try {
      loading.value = true
      error.value = null
      const backendCategories = await categoryApi.getAll()
      categories.value = CategoryAdapter.toDomainArray(backendCategories)
    } catch (e: any) {
      error.value = 'Failed to fetch categories'
    } finally {
      loading.value = false
    }
  }

  async function createCategory(createDto: CategoryCreate) {
    try {
      loading.value = true
      error.value = null
      const newCategoryRaw = await categoryApi.create(createDto)
      const newCategory = CategoryAdapter.toDomain(newCategoryRaw)
      categories.value.push(newCategory)
      return newCategory
    } catch (e: any) {
      console.error('Create category error:', e, e?.response?.data)
      error.value = e?.response?.data?.message || e?.message || 'Failed to create category'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(id: string, createDto: CategoryCreate) {
    const index = categories.value.findIndex(c => c.getId() === id)
    if (index === -1) {
      error.value = 'Category not found'
      throw new Error('Category not found')
    }
    const oldCategory = categories.value[index]
    try {
      loading.value = true
      error.value = null
      const updatedCategoryRaw = await categoryApi.update(id, createDto)
      const updatedCategory = CategoryAdapter.toDomain(updatedCategoryRaw)
      categories.value[index] = updatedCategory
      return updatedCategory
    } catch (e: any) {
      categories.value[index] = oldCategory
      console.error('Update category error:', e, e?.response?.data)
      error.value = e?.response?.data?.message || e?.message || 'Failed to update category'
      throw e
    } finally {
      loading.value = false
    }
  }

  function getCategoryById(id: string): Category | undefined {
    const result = categories.value.find(c => c.getId() === id)
    return result as Category | undefined
  }

  function getCategoriesByType(type: CategoryTypeEnum | string): Category[] {
    const categoryType = typeof type === 'string' ? CategoryType.of(type) : CategoryType.fromEnum(type)
    const result = categories.value.filter(c => c.getType().equals(categoryType))
    return result as Category[]
  }

  async function deleteCategory(id: string): Promise<void> {
    const index = categories.value.findIndex(c => c.getId() === id)
    if (index === -1) {
      error.value = 'Category not found'
      throw new Error('Category not found')
    }

    // Check if category can be deleted using domain logic
    const category = categories.value[index]
    if (!category.canDelete()) {
      error.value = 'Category cannot be deleted (has transactions or is inactive)'
      throw new Error('Category cannot be deleted')
    }

    const removedCategory = categories.value[index]
    categories.value.splice(index, 1)
    try {
      loading.value = true
      error.value = null
      await categoryApi.delete(id)
    } catch (e) {
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
    transferCategories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    getCategoryById,
    getCategoriesByType,
    deleteCategory
  }
})

export type { CategoryCreate } from '@/api/category'
export type { Category } from '@/domain/models'

