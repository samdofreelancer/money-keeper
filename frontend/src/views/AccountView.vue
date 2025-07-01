<template>
  <div class="page-container" data-testid="account-page">
    <error-message 
      v-if="!dialogVisible"
      :error="accountStore.error || undefined"
      @close="accountStore.error = null"
      data-testid="error-message"
    />

    <div class="page-header" data-testid="page-header">
      <div class="left">
        <h2 class="title" data-testid="page-title">Accounts</h2>
        <p class="description" data-testid="page-description">Manage your accounts and balances</p>
      </div>
      <div class="right">
        <el-button type="primary" @click="showCreateDialog" data-testid="add-account-button">
          <el-icon class="mr-2"><Plus /></el-icon>
          Add Account
        </el-button>
      </div>
    </div>

    <el-card shadow="never" class="table-card" data-testid="account-card">
      <loading-overlay :loading="accountStore.loading" data-testid="loading-overlay" />

      <div class="total-balance" data-testid="total-balance">
        Total Balance of Active Accounts: {{ formattedTotalBalance }}
      </div>

      <el-input
        v-model="searchQuery"
        placeholder="Search accounts..."
        class="search-input"
        data-testid="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-table
        :data="filteredAccounts"
        style="width: 100%"
        data-testid="account-table"
        row-key="id"
      >
        <el-table-column
          label="Type"
          width="60"
          data-testid="column-type"
        >
          <template #default="{ row }">
            <el-icon :style="{ color: getIconColor(row.type) }" data-testid="account-type-icon">
              <component :is="getIconComponent(row.type)" />
            </el-icon>
          </template>
        </el-table-column>

        <el-table-column
          prop="name"
          label="Name"
          data-testid="column-name"
        />

        <el-table-column
          prop="balance"
          label="Balance"
          width="120"
          data-testid="column-balance"
        >
          <template #default="{ row }">
            {{ formatCurrency(row.balance) }}
          </template>
        </el-table-column>

        <el-table-column
          label="Actions"
          width="120"
          data-testid="column-actions"
        >
          <template #default="{ row }">
            <el-button-group data-testid="account-button-group">
              <el-button type="primary" link @click.stop="handleEdit(row)" data-testid="edit-account-button">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" link @click.stop="handleDelete(row)" data-testid="delete-account-button">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Create/Edit Account Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Edit Account' : 'Create Account'"
      width="500px"
      data-testid="account-dialog"
    >
      <el-form
        ref="formRef"
        :model="accountForm"
        :rules="rules"
        label-width="120px"
        class="account-form"
        data-testid="account-form"
      >
        <el-form-item label="Name" prop="accountName" data-testid="form-item-name">
          <el-input v-model="accountForm.accountName" placeholder="Enter account name" data-testid="input-account-name" />
        </el-form-item>

        <el-form-item label="Type" prop="type" data-testid="form-item-type">
          <el-select v-model="accountForm.type" placeholder="Select account type" data-testid="select-account-type">
            <el-option
              v-for="type in accountTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
              data-testid="option-account-type"
            >
              <el-icon><component :is="type.icon" /></el-icon>
              <span class="ml-2">{{ type.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Balance" prop="initBalance" data-testid="form-item-balance">
          <el-input-number v-model="accountForm.initBalance" :min="0" data-testid="input-account-balance" />
        </el-form-item>

        <el-form-item label="Currency" prop="currency" data-testid="form-item-currency">
          <el-select v-model="accountForm.currency" placeholder="Select currency" data-testid="select-account-currency">
            <el-option
              v-for="currency in supportedCurrencies"
              :key="currency.id"
              :label="currency.name"
              :value="currency.code"
              data-testid="option-account-currency"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Description" prop="description" data-testid="form-item-description">
          <el-input v-model="accountForm.description" placeholder="Enter description (optional)" data-testid="input-account-description" />
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
      title="Delete Account"
      width="400px"
      data-testid="delete-dialog"
    >
      <p data-testid="delete-dialog-message">Are you sure you want to delete this account? This action cannot be undone.</p>
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
import { useAccountStore } from '@/stores/account'
import { Plus, Search, Edit, Delete, Wallet } from '@element-plus/icons-vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { accountApi } from '@/api/account'
import type { FormInstance } from 'element-plus'
import type { Account, AccountCreate } from '@/stores/account'
import { accountTypes } from '@/constants/accountTypes'

const accountStore = useAccountStore()
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const searchQuery = ref('')
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const deleteId = ref<string | null>(null)
const duplicateNameError = ref('')
const supportedCurrencies = ref<any[]>([])

const accountForm = ref<AccountCreate>({
  accountName: '',
  type: '',
  initBalance: 0,
  currency: '',
  description: ''
})

const rules = {
  accountName: [
    { required: true, message: 'Please input account name', trigger: ['blur', 'change'] },
    { validator: (rule: any, value: any, callback: (error?: string) => void) => {
        if (duplicateNameError.value) {
          callback(duplicateNameError.value)
        } else {
          callback()
        }
      }, trigger: ['blur', 'change'] }
  ],
  type: [
    { required: true, message: 'Please select account type', trigger: 'change' }
  ],
  initBalance: [
    { type: 'number', required: true, message: 'Please input balance', trigger: ['blur', 'change'] },
    { validator: (rule: any, value: any, callback: (error?: string) => void) => {
        if (value === undefined || value === null || value <= 0) {
          callback('Balance must be greater than 0')
        } else {
          callback()
        }
      }, trigger: ['blur', 'change'] }
  ]
}

const filteredAccounts = computed(() => {
  let accounts = accountStore.accounts

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    accounts = accounts.filter(a =>
      a.name.toLowerCase().includes(query)
    )
  }

  return accounts
})

const formattedTotalBalance = computed(() => {
  return formatCurrency(accountStore.totalBalance)
})

import { currencyApi } from '@/api/currency'

onMounted(async () => {
  await accountStore.fetchAccounts()
  supportedCurrencies.value = await currencyApi.getSupportedCurrencies()
})

function getIconComponent(type: string) {
  const typeObj = accountTypes.find(t => t.value === type)
  return typeObj ? typeObj.icon : 'Wallet'
}

function getIconColor(type: string) {
  switch (type) {
    case 'E_WALLET':
      return '#409EFF'
    case 'BANK_ACCOUNT':
      return '#67C23A'
    default:
      return '#909399'
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function showCreateDialog() {
  isEditing.value = false
  editingId.value = null
  accountForm.value = {
    accountName: '',
    type: '',
    initBalance: 0,
    currency: 'USD',
    description: ''
  }
  dialogVisible.value = true
}

function handleEdit(account: Account) {
  isEditing.value = true
  editingId.value = account.id
  accountForm.value = {
    accountName: account.name,
    type: account.type,
    initBalance: account.balance,
    currency: account.currency || 'USD',
    description: ''
  }
  dialogVisible.value = true
}

function handleDelete(account: Account) {
  deleteId.value = account.id
  deleteDialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // Map frontend form fields to backend fields
        const payload = {
          accountName: accountForm.value.accountName || '',
          type: accountForm.value.type,
          initBalance: accountForm.value.initBalance ?? 0,
          currency: accountForm.value.currency || 'USD',
          description: accountForm.value.description || ''
        }
        if (isEditing.value && editingId.value) {
          await accountStore.updateAccount(editingId.value, payload)
          await accountStore.fetchAccounts()
          ElMessage.success('Account updated successfully')
        } else {
          await accountStore.createAccount(payload)
          await accountStore.fetchAccounts()
          ElMessage.success('Account created successfully')
        }
        dialogVisible.value = false
      } catch (error) {
        const errorMsg = accountStore.error || (isEditing.value ? 'Failed to update account' : 'Failed to create account')
        if ((errorMsg === 'Account name already exists' || errorMsg.includes('409')) && formRef.value) {
          accountStore.error = null
          duplicateNameError.value = 'Account name already exists'
          await nextTick()
          await formRef.value.validateField('accountName')
        } else {
          ElMessage.error(errorMsg)
        }
      }
    }
  })
}

async function confirmDelete() {
  if (!deleteId.value) return

  try {
    await accountStore.deleteAccount(deleteId.value)
    ElMessage.success('Account deleted successfully')
    await accountStore.fetchAccounts()
  } catch (error) {
    // ElMessage.error is already called from the store
    throw error
  } finally {
    deleteDialogVisible.value = false
  }
}

watch(dialogVisible, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    if (formRef.value) {
      formRef.value.resetFields()
    }
    accountForm.value = {
      accountName: '',
      type: '',
      initBalance: 0,
      currency: 'USD',
      description: ''
    }
    duplicateNameError.value = ''
  }
})

watch(() => accountForm.value.accountName, () => {
  if (duplicateNameError.value) {
    duplicateNameError.value = ''
    if (formRef.value) {
      formRef.value.clearValidate(['accountName'])
    }
  }
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

.total-balance {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 16px;
}

.search-input {
  width: 240px;
  margin-bottom: 16px;
}

.mr-2 {
  margin-right: 8px;
}

.ml-2 {
  margin-left: 8px;
}

.account-form {
  margin-top: 16px;
}
  </style>
