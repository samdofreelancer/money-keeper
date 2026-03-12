import axios from 'axios'
import { apiBaseUrl } from '@/config'

const api = axios.create({
  baseURL: apiBaseUrl ? `${apiBaseUrl}/api/tax` : 'http://localhost:8081/api/tax',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface SalaryCalculationRequest {
  grossSalary: number
  tetBonus: number
  insuranceBase: number
  dependents: number
  bhxhRate: number
  bhytRate: number
  bhtnRate: number
  personalDeduction: number
  dependentDeductionPerPerson: number
  taxFreeAllowance: number
  otherDeduction: number
  taxBracketType: string
  wageZone: string
}

export interface SalaryCalculationResponse {
  grossSalary: number
  bhxh: number
  bhyt: number
  bhtn: number
  totalInsurance: number
  incomeAfterInsurance: number
  tetBonus: number
  totalDeduction: number
  taxableIncome: number
  totalTax: number
  salaryTax: number
  bonusTax: number
  netBeforeAllowance: number
  taxFreeAllowance: number
  otherDeduction: number
  netMonthly: number
  netBonus: number
  totalNetSalary: number
}

export interface TaxConfigResponse {
  taxBrackets: TaxBracketOption[]
  deductionBrackets: DeductionBracketOption[]
  wageZones: WageZoneOption[]
}

export interface TaxBracketOption {
  value: string
  label: string
  effectiveDate: string
  brackets?: TaxBracketDetail[]
}

export interface TaxBracketDetail {
  id?: string
  minIncome: number
  maxIncome: number | null
  rate: number
  deduction: number
  order: number
}

export interface DeductionBracketOption {
  value: string
  label: string
  personalDeduction: number
  dependentDeduction: number
  effectiveDate: string
}

export interface WageZoneOption {
  value: string
  label: string
  minimumWage: number
  bhtnCeiling: number
}

export const taxCalculatorAPI = {
  /**
   * Calculate salary and tax
   */
  calculateSalary(request: SalaryCalculationRequest): Promise<SalaryCalculationResponse> {
    return api.post<SalaryCalculationResponse>('/tax/calculate', request).then(response => response.data)
  },

  /**
   * Get tax configuration
   */
  getTaxConfig(): Promise<TaxConfigResponse> {
    return api.get<TaxConfigResponse>('/tax/config').then(response => response.data)
  },

  /**
   * Health check
   */
  health(): Promise<string> {
    return api.get<string>('/tax/health').then(response => response.data)
  },

  /**
   * Create a new tax bracket
   */
  createTaxBracket(request: any): Promise<any> {
    return api.post<any>('/tax/brackets/bracket', request).then(response => response.data)
  },

  /**
   * Update an existing tax bracket
   */
  updateTaxBracket(value: string, request: any): Promise<any> {
    return api.put<any>(`/tax/brackets/bracket/${value}`, request).then(response => response.data)
  },

  /**
   * Delete a tax bracket
   */
  deleteTaxBracket(value: string): Promise<any> {
    return api.delete<any>(`/tax/brackets/bracket/${value}`).then(response => response.data)
  },

  /**
   * Get a specific tax bracket by value
   */
  getTaxBracketByValue(value: string): Promise<any> {
    return api.get<any>(`/tax/brackets/bracket/${value}`).then(response => response.data)
  },

  /**
   * Reset all tax configuration to default values
   */
  resetToDefaults(): Promise<any> {
    return api.post<any>('/tax/brackets/reset').then(response => response.data)
  }
}

export default api
