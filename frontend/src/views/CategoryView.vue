<template>
  <div class="page-container" data-testid="category-page">
    <error-message 
      v-if="!dialogVisible"
      :error="categoryStore.error || undefined"
      @close="categoryStore.error = null"
      data-testid="error-message"
    />
    
    <div class="page-header" data-testid="page-header">
      <div class="left">
        <h2 class="title" data-testid="page-title">Categories</h2>
        <p class="description" data-testid="page-description">Manage your income and expense categories</p>
      </div>
      <div class="right">
        <el-button type="primary" @click="showCreateDialog" data-testid="add-category-button">
          <el-icon class="mr-2"><Plus /></el-icon>
          Add Category
        </el-button>
      </div>
    </div>

      <el-card shadow="never" class="table-card" data-testid="category-card">
      <loading-overlay :loading="categoryStore.loading" data-testid="loading-overlay" />

      <el-tabs v-model="activeTab" class="category-tabs" data-testid="category-tabs">
        <el-tab-pane label="All" name="all" data-testid="tab-all" />
        <el-tab-pane label="Expense" name="expense" data-testid="tab-expense" />
        <el-tab-pane label="Income" name="income" data-testid="tab-income" />
      </el-tabs>

      <div class="table-toolbar" data-testid="table-toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="Search categories..."
          class="search-input"
          data-testid="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-tree
        :data="nestedCategories"
        :props="treeProps"
        node-key="id"
        default-expand-all
        highlight-current
        class="category-tree"
        data-testid="category-tree"
      >
        <template #default="{ node, data }">
          <div class="tree-node-content" style="display: flex; align-items: center; justify-content: space-between; width: 100%;" data-testid="tree-node-content">
            <div style="display: flex; align-items: center;">
              <el-icon size="20" :style="{ color: getIconColor(data.type) }" class="mr-2" data-testid="category-icon">
                <component :is="data.icon || 'Grid'" />
              </el-icon>
              <span data-testid="category-name">{{ data.name }}</span>
              <el-tag :type="data.type === 'EXPENSE' ? 'danger' : 'success'" size="small" style="margin-left: 8px;" data-testid="category-type">
                {{ data.type }}
              </el-tag>
            </div>
            <div>
              <el-button-group data-testid="category-button-group">
                <el-button type="primary" link @click.stop="handleEdit(data)" data-testid="edit-category-button">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="danger" link @click.stop="handleDelete(data)" data-testid="delete-category-button">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
        </template>
      </el-tree>
    </el-card>

    <!-- Create/Edit Category Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Edit Category' : 'Create Category'"
      width="500px"
      data-testid="category-dialog"
    >
      <el-form
        ref="formRef"
        :model="categoryForm"
        :rules="rules"
        label-width="120px"
        class="category-form"
        data-testid="category-form"
      >
        <el-form-item label="Name" prop="name" data-testid="form-item-name">
          <el-input v-model="categoryForm.name" placeholder="Enter category name" data-testid="input-category-name" />
        </el-form-item>
        
        <el-form-item label="Icon" prop="icon" data-testid="form-item-icon">
          <el-select v-model="categoryForm.icon" class="icon-select" data-testid="select-icon">
            <el-option
              v-for="icon in availableIcons"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
              data-testid="option-icon"
            >
              <el-icon><component :is="icon.value" /></el-icon>
              <span class="ml-2">{{ icon.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Type" prop="type" data-testid="form-item-type">
          <el-radio-group v-model="categoryForm.type" data-testid="radio-group-type">
            <el-radio-button label="EXPENSE" data-testid="radio-expense">Expense</el-radio-button>
            <el-radio-button label="INCOME" data-testid="radio-income">Income</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="Parent Category" data-testid="form-item-parent-category">
          <el-select
            v-model="categoryForm.parentId"
            clearable
            placeholder="Select parent category"
            class="parent-select"
            data-testid="select-parent-category"
          >
            <el-option
              v-for="category in availableParents"
              :key="category.id"
              :label="category.name"
              :value="category.id"
              :disabled="category.id === editingId"
              data-testid="option-parent-category"
            >
              <el-icon><component :is="category.icon || 'Grid'" /></el-icon>
              <span class="ml-2">{{ category.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer" data-testid="dialog-footer">
          <el-button @click="dialogVisible = false" data-testid="button-cancel">Cancel</el-button>
          <el-button type="primary" @click="handleSubmit" data-testid="button-submit">
            {{ isEditing ? 'Save' : 'Create' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Delete Confirmation Dialog -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="Delete Category"
      width="400px"
      data-testid="delete-dialog"
    >
      <p data-testid="delete-dialog-message">Are you sure you want to delete this category? This action cannot be undone.</p>
      <template #footer>
        <span class="dialog-footer" data-testid="delete-dialog-footer">
          <el-button @click="deleteDialogVisible = false" data-testid="button-cancel-delete">Cancel</el-button>
          <el-button type="danger" @click="confirmDelete" data-testid="button-confirm-delete">Delete</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useCategoryStore } from '@/stores/category'
import { Plus, Search, Edit, Delete, Grid } from '@element-plus/icons-vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import type { FormInstance } from 'element-plus'
import type { Category, CategoryCreate } from '@/api/category'

const categoryStore = useCategoryStore()
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const activeTab = ref('all')
const searchQuery = ref('')
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const duplicateNameError = ref('')

const categoryForm = ref<CategoryCreate>({
  name: '',
  icon: '',
  type: 'EXPENSE'
})

const rules = {
  name: [
    { required: true, message: 'Please input category name', trigger: ['blur', 'change'] },
    { validator: (rule: any, value: any, callback: (error?: string) => void) => {
        console.log('Validator called, value:', value, 'duplicateNameError:', duplicateNameError.value);
        if (duplicateNameError.value) {
          callback(duplicateNameError.value)
        } else {
          callback()
        }
      }, trigger: ['blur', 'change'] }
  ],
  icon: [{ required: true, message: 'Please select an icon', trigger: 'change' }],
  type: [{ required: true, message: 'Please select a type', trigger: 'change' }]
}

const availableIcons = [
  { label: 'Grid', value: 'Grid' },
  { label: 'Shopping', value: 'ShoppingCart' },
  { label: 'Food', value: 'Food' },
  { label: 'Transport', value: 'Van' },
  { label: 'House', value: 'House' },
  { label: 'Bills', value: 'Document' },
  { label: 'Entertainment', value: 'Film' },
  { label: 'Health', value: 'FirstAidKit' },
  { label: 'Education', value: 'Reading' },
  { label: 'Salary', value: 'Money' },
  { label: 'Investment', value: 'TrendCharts' }
]

const filteredCategories = computed(() => {
  let categories = categoryStore.categories

  if (activeTab.value !== 'all') {
    categories = categories.filter(c => 
      c.type.toLowerCase() === activeTab.value
    )
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    categories = categories.filter(c => 
      c.name.toLowerCase().includes(query)
    )
  }

  return categories
})

const nestedCategories = computed(() => {
  const map = new Map()
  const roots: any[] = []

  // Initialize map with all categories
  filteredCategories.value.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] })
  })

  // Build tree structure
  map.forEach(cat => {
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId).children.push(cat)
    } else {
      roots.push(cat)
    }
  })

  return roots
})

const treeProps = {
  children: 'children',
  label: 'name'
}

const availableParents = computed(() => {
  return categoryStore.categories.filter(c => c.id !== editingId.value)
})

onMounted(async () => {
  await categoryStore.fetchCategories()
})

function getIconColor(type: string) {
  return type === 'EXPENSE' ? '#f56c6c' : '#67c23a'
}

function showCreateDialog() {
  isEditing.value = false
  editingId.value = null
  categoryForm.value = {
    name: '',
    icon: '',
    type: 'EXPENSE'
  }
  dialogVisible.value = true
}

function handleEdit(category: Category) {
  isEditing.value = true
  editingId.value = category.id
  categoryForm.value = {
    name: category.name,
    icon: category.icon,
    type: category.type,
    parentId: category.parentId
  }
  dialogVisible.value = true
}

function handleDelete(category: Category) {
  editingId.value = category.id
  deleteDialogVisible.value = true
}

function getParentName(parentId: string | null) {
  if (!parentId) return '-'
  const parent = categoryStore.categories.find(c => c.id === parentId)
  return parent?.name || '-'
}

async function handleSubmit() {
  console.log('handleSubmit called')
  if (!formRef.value) {
    console.log('formRef is not set')
    return
  }

  await formRef.value.validate(async (valid) => {
    console.log('form validation result:', valid)
    if (valid) {
      try {
        if (isEditing.value && editingId.value) {
          console.log('Calling updateCategory with id:', editingId.value, 'data:', categoryForm.value)
          await categoryStore.updateCategory(editingId.value, categoryForm.value)
          ElMessage.success('Category updated successfully')
        } else {
          console.log('Calling createCategory with data:', categoryForm.value)
          await categoryStore.createCategory(categoryForm.value)
          ElMessage.success('Category created successfully')
        }
        dialogVisible.value = false
      } catch (error) {
        console.log('handleSubmit error:', error, 'categoryStore.error:', categoryStore.error)
        const errorMsg = categoryStore.error || (isEditing.value ? 'Failed to update category' : 'Failed to create category')
        if (errorMsg === 'Category name already exists' && formRef.value) {
          categoryStore.error = null; // Clear global error first
          duplicateNameError.value = errorMsg
          await nextTick()
          await formRef.value.validateField('name')
        } else {
          ElMessage.error(errorMsg)
        }
      }
    }
  })
}

async function confirmDelete() {
  if (!editingId.value) return

  try {
    await categoryStore.deleteCategory(editingId.value)
    ElMessage.success('Category deleted successfully')
    await categoryStore.fetchCategories()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    // ElMessage.error is already called from the store
    throw error
  } finally {
    deleteDialogVisible.value = false
  }
}

// Clear duplicate error when dialog closes or name changes
watch(dialogVisible, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    if (formRef.value) {
      formRef.value.resetFields()
    }
    categoryForm.value = {
      name: '',
      icon: '',
      type: 'EXPENSE'
    }
    duplicateNameError.value = ''
  }
})
watch(() => categoryForm.value.name, () => {
  if (duplicateNameError.value) duplicateNameError.value = ''
})
</script>

<style scoped>
.title {
  margin: 0;
  font-size: 20px;
  color: var(--heading-color);
}

.description {
  margin: 8px 0 0;
  color: var(--text-color-secondary);
}

.table-card {
  margin-top: 24px;
}

.category-tabs {
  margin-bottom: 16px;
}

.table-toolbar {
  margin-bottom: 16px;
}

.search-input {
  width: 240px;
}

.mr-2 {
  margin-right: 8px;
}

.ml-2 {
  margin-left: 8px;
}

.category-form {
  margin-top: 16px;
}

.icon-select,
.parent-select {
  width: 100%;
}

:deep(.el-radio-button__inner) {
  min-width: 100px;
}
</style>
