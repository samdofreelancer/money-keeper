import axios from 'axios'
import { currencyApi } from './currency'
import type { AccountDTO } from './adapters'

export interface AccountCreate {
  accountName: string
  initBalance: number
  type: string
  currency: string
  description?: string
  active?: boolean
}

import { apiBaseUrl } from '@/config'

const accountApiClient = axios.create({
  baseURL: apiBaseUrl + '/accounts',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const accountApi = {
  async getAll(): Promise<AccountDTO[]> {
    const response = await accountApiClient.get('/')
    return response.data
  },

  async create(account: AccountCreate): Promise<AccountDTO> {
    const response = await accountApiClient.post('/', account)
    return response.data
  },

  async update(id: string, account: AccountCreate): Promise<AccountDTO> {
    const response = await accountApiClient.put(`/${id}`, account)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await accountApiClient.delete(`/${id}`)
  },

  async getSupportedCurrencies(): Promise<string[]> {
    const currencies = await currencyApi.getSupportedCurrencies()
    return currencies.map(c => c.code)
  }
}
