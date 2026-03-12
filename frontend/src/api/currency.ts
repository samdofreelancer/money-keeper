import axios from 'axios'
import { apiBaseUrl } from '@/config'

export interface CurrencyDto {
  id: number
  code: string
  name: string
  symbol: string
  flag: string
}

const currencyApiClient = axios.create({
  baseURL: apiBaseUrl ? `${apiBaseUrl}/currencies` : 'http://localhost:8081/api/currencies',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const currencyApi = {
  async getSupportedCurrencies(): Promise<CurrencyDto[]> {
    const response = await currencyApiClient.get('/')
    return response.data
  }
}
