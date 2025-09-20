import axios from 'axios'
import { apiBaseUrl } from '@/config'

export interface RatesResponseDto {
  base: string
  rates: Record<string, number>
}

const client = axios.create({
  baseURL: apiBaseUrl + '/exchange-rates',
  headers: { 'Content-Type': 'application/json' }
})

export const exchangeRateApi = {
  async latest(base: string): Promise<RatesResponseDto> {
    const res = await client.get('/latest', { params: { base } })
    return res.data
  }
} 