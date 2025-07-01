import axios from 'axios'

export interface Account {
  id: string
  name: string
  type: string
  balance: number
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

import { apiBaseUrl } from '@/config'

const apiClient = axios.create({
  baseURL: apiBaseUrl + '/accounts',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const accountApi = {
  async getAll(): Promise<Account[]> {
    const response = await apiClient.get('/')
    return response.data
  },

  async create(account: AccountCreate): Promise<Account> {
    const response = await apiClient.post('/', account)
    return response.data
  },

  async update(id: string, account: AccountCreate): Promise<Account> {
    const response = await apiClient.put(`/${id}`, account)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/${id}`)
  },

  async getSupportedCurrencies(): Promise<string[]> {
    const response = await apiClient.get('/currencies')
    return response.data
  }
}
