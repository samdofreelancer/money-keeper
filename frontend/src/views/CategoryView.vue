<template>
  <div class="page-container">
    <error-message 
      :error="categoryStore.error"
      @close="categoryStore.error = null"
    />
    
    <div class="page-header">
      <div class="left">
        <h2 class="title">Categories</h2>
        <p class="description">Manage your income and expense categories</p>
      </div>
      <div class="right">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon class="mr-2"><Plus /></el-icon>
          Add Category
        </el-button>
      </div>
    </div>

    <el-card shadow="never" class="table-card">
      <loading-overlay :loading="categoryStore.loading" />

      <el-tabs v-model="activeTab" class="category-tabs">
        <el-tab-pane label="All" name="all" />
        <el-tab-pane label="Expense" name="expense" />
        <el-tab-pane label="Income" name="income" />
      </el-tabs>

      <div class="table-toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="Search categories..."
          class="search-input"
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
      >
        <template #default="{ node, data }">
          <div class="tree-node-content" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center;">
              <el-icon size="20" :style="{ color: getIconColor(data.type) }" class="mr-2">
                <component :is="data.icon || 'Grid'" />
              </el-icon>
              <span>{{ data.name }}</span>
              <el-tag :type="data.type === 'EXPENSE' ? 'danger' : 'success'" size="small" style="margin-left: 8px;">
                {{ data.type }}
              </el-tag>
            </div>
            <div>
              <el-button-group>
                <el-button type="primary" link @click.stop="handleEdit(data)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="danger" link @click.stop="handleDelete(data)">
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
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="categoryForm"
        :rules="rules"
        label-width="120px"
        class="category-form"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="categoryForm.name" placeholder="Enter category name" />
        </el-form-item>
        
        <el-form-item label="Icon" prop="icon">
          <el-select v-model="categoryForm.icon" class="icon-select">
            <el-option
              v-for="icon in availableIcons"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
            >
              <el-icon><component :is="icon.value" /></el-icon>
              <span class="ml-2">{{ icon.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Type" prop="type">
          <el-radio-group v-model="categoryForm.type">
            <el-radio-button label="EXPENSE">Expense</el-radio-button>
            <el-radio-button label="INCOME">Income</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="Parent Category">
          <el-select
            v-model="categoryForm.parentId"
            clearable
            placeholder="Select parent category"
            class="parent-select"
          >
            <el-option
              v-for="category in availableParents"
              :key="category.id"
              :label="category.name"
              :value="category.id"
              :disabled="category.id === editingId"
            >
              <el-icon><component :is="category.icon || 'Grid'" /></el-icon>
              <span class="ml-2">{{ category.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleSubmit">
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
    >
      <p>Are you sure you want to delete this category? This action cannot be undone.</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="confirmDelete">Delete</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

const categoryForm = ref<CategoryCreate>({
  name: '',
  icon: '',
  type: 'EXPENSE'
})

const rules = {
  name: [{ required: true, message: 'Please input category name', trigger: 'blur' }],
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
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEditing.value && editingId.value) {
          // TODO: Implement update
          ElMessage.success('Category updated successfully')
        } else {
          await categoryStore.createCategory(categoryForm.value)
          ElMessage.success('Category created successfully')
        }
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error(isEditing.value ? 'Failed to update category' : 'Failed to create category')
      }
    }
  })
}

async function confirmDelete() {
  if (!editingId.value) return

  try {
    // TODO: Implement delete
    ElMessage.success('Category deleted successfully')
    deleteDialogVisible.value = false
  } catch (error) {
    ElMessage.error('Failed to delete category')
  }
}
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
