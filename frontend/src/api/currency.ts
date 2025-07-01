import axios from 'axios'
import { apiBaseUrl } from '@/config'

const currencyApiClient = axios.create({
  baseURL: apiBaseUrl + '/currencies',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const currencyApi = {
  async getSupportedCurrencies(): Promise<string[]> {
    const response = await currencyApiClient.get('/')
    return response.data
  }
}
