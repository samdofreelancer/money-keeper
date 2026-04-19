import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { accountApi, type AccountCreate } from '@/api/account'
import { AccountAdapter, type AccountDTO } from '@/api/adapters'
import { Account } from '@/domain/models'
import { Money } from '@/domain/value-objects'

function generateTempId(): string {
  return 'temp-' + Date.now().toString()
}

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeAccounts = computed((): Account[] => {
    const result = accounts.value.filter(a => a.isActive())
    return result as Account[]
  })

  const totalBalance = computed((): Money | null => {
    if (activeAccounts.value.length === 0) return null
    
    try {
      let total = activeAccounts.value[0].getInitialBalance()
      for (let i = 1; i < activeAccounts.value.length; i++) {
        // Only sum accounts with same currency
        if (activeAccounts.value[i].getInitialBalance().getCurrency().equals(
          total.getCurrency()
        )) {
          total = total.add(activeAccounts.value[i].getInitialBalance())
        }
      }
      return total
    } catch {
      return null
    }
  })


  async function fetchAccounts(): Promise<void> {
    try {
      loading.value = true
      error.value = null
      const backendAccounts = await accountApi.getAll()
      accounts.value = AccountAdapter.toDomainArray(backendAccounts)
    } catch (e: any) {
      error.value = 'Failed to fetch accounts'
    } finally {
      loading.value = false
    }
  }

  async function createAccount(createDto: AccountCreate): Promise<Account> {
    try {
      loading.value = true
      error.value = null
      const newAccountRaw = await accountApi.create(createDto)
      const newAccount = AccountAdapter.toDomain(newAccountRaw)
      accounts.value.push(newAccount)
      return newAccount
    } catch (e: any) {
      console.error('Create account error:', e, e?.response?.data)
      error.value = e?.response?.data?.message || e?.message || 'Failed to create account'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateAccount(id: string, createDto: AccountCreate): Promise<Account> {
    const index = accounts.value.findIndex(a => a.getId() === id)
    if (index === -1) {
      error.value = 'Account not found'
      throw new Error('Account not found')
    }
    const oldAccount = accounts.value[index]
    try {
      loading.value = true
      error.value = null
      const updatedRaw = await accountApi.update(id, createDto)
      const updatedAccount = AccountAdapter.toDomain(updatedRaw)
      accounts.value[index] = updatedAccount
      return updatedAccount
    } catch (e: any) {
      accounts.value[index] = oldAccount
      console.error('Update account error:', e, e?.response?.data)
      error.value = e?.response?.data?.message || e?.message || 'Failed to update account'
      throw e
    } finally {
      loading.value = false
    }
  }

  function getAccountById(id: string): Account | undefined {
    const result = accounts.value.find(a => a.getId() === id)
    return result as Account | undefined
  }

  async function deleteAccount(id: string): Promise<void> {
    const index = accounts.value.findIndex(a => a.getId() === id)
    if (index === -1) {
      error.value = 'Account not found'
      throw new Error('Account not found')
    }
    const removedAccount = accounts.value[index]
    accounts.value.splice(index, 1)
    try {
      loading.value = true
      error.value = null
      await accountApi.delete(id)
    } catch (e) {
      accounts.value.splice(index, 0, removedAccount)
      error.value = 'Failed to delete account'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    accounts,
    activeAccounts,
    totalBalance,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    getAccountById,
    deleteAccount
  }
})

export type { AccountCreate } from '@/api/account'
export type { Account } from '@/domain/models'
