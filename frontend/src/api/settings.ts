import axios from 'axios'
import { apiBaseUrl } from '@/config'

export interface AppSettingsDto {
  id: number
  defaultCurrency: string
}

const settingsClient = axios.create({
  baseURL: apiBaseUrl + '/settings',
  headers: { 'Content-Type': 'application/json' }
})

export const settingsApi = {
  async get(): Promise<AppSettingsDto> {
    const res = await settingsClient.get('/')
    return res.data
  },
  async updateCurrency(defaultCurrency: string): Promise<AppSettingsDto> {
    const res = await settingsClient.put('/currency', { defaultCurrency })
    return res.data
  },
  async reset(): Promise<AppSettingsDto> {
    const res = await settingsClient.post('/reset')
    return res.data
  }
} 