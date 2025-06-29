import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { accountApi, type Account, type AccountCreate } from '@/api/account'

function generateTempId(): string {
  return 'temp-' + Date.now().toString()
}

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeAccounts = computed((): Account[] =>
    accounts.value.filter((a: Account) => a.active)
  )

  const totalBalance = computed((): number =>
    activeAccounts.value.reduce((sum: number, account: Account) => sum + account.balance, 0)
  )

  async function fetchAccounts(): Promise<void> {
    try {
      loading.value = true
      error.value = null
      accounts.value = await accountApi.getAll()
    } catch (e: any) {
      error.value = 'Failed to fetch accounts'
    } finally {
      loading.value = false
    }
  }

  async function createAccount(account: AccountCreate): Promise<Account> {
    const tempId = generateTempId()
    const tempAccount: Account = {
      id: tempId,
      name: account.name,
      type: account.type,
      balance: account.balance ?? 0,
      active: account.active ?? true
    }
    accounts.value.push(tempAccount)
    try {
      loading.value = true
      error.value = null
      const newAccount = await accountApi.create(account)
      const index = accounts.value.findIndex((a: Account) => a.id === tempId)
      if (index !== -1) {
        accounts.value[index] = newAccount
      }
      return newAccount
    } catch (e: any) {
      accounts.value = accounts.value.filter((a: Account) => a.id !== tempId)
      console.error('Create account error:', e, e?.response?.data)
      error.value = e?.response?.data?.message || e?.message || 'Failed to create account'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateAccount(id: string, account: AccountCreate): Promise<Account> {
    const index = accounts.value.findIndex((a: Account) => a.id === id)
    if (index === -1) {
      error.value = 'Account not found'
      throw new Error('Account not found')
    }
    const oldAccount = { ...accounts.value[index] }
    accounts.value[index] = {
      ...oldAccount,
      name: account.name,
      type: account.type,
      balance: account.balance ?? 0,
      active: account.active ?? true
    }
    try {
      loading.value = true
      error.value = null
      const updatedAccount = await accountApi.update(id, account)
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
    return accounts.value.find((a: Account) => a.id === id)
  }

  async function deleteAccount(id: string): Promise<void> {
    const index = accounts.value.findIndex((a: Account) => a.id === id)
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
