import axios from 'axios'
import { currencyApi } from './currency'
import { apiBaseUrl } from '@/config'

export interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  active: boolean
}

export interface AccountCreate {
  accountName: string
  initBalance: number
  type: string
  currency: string
  description?: string
  active?: boolean
}

const accountApiClient = axios.create({
  baseURL: apiBaseUrl ? `${apiBaseUrl}/accounts` : 'http://localhost:8081/api/accounts',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const accountApi = {
  async getAll(): Promise<Account[]> {
    const response = await accountApiClient.get('/')
    return response.data
  },

  async create(account: AccountCreate): Promise<Account> {
    const response = await accountApiClient.post('/', account)
    return response.data
  },

  async update(id: string, account: AccountCreate): Promise<Account> {
    const response = await accountApiClient.put(`/${id}`, account)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await accountApiClient.delete(`/${id}`)
  },

  async getSupportedCurrencies(): Promise<string[]> {
    return currencyApi.getSupportedCurrencies()
  }
}
