import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
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
  }
}

export default api
