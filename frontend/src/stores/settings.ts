import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsApi } from '@/api/settings'
import { Currency } from '@/domain/value-objects'

const DEFAULT_CURRENCY = 'USD'
const STORAGE_KEY_DEFAULT_CURRENCY = 'default_currency'

export const useSettingsStore = defineStore('settings', () => {
  const defaultCurrencyCode = ref<string>(
    localStorage.getItem(STORAGE_KEY_DEFAULT_CURRENCY) || DEFAULT_CURRENCY
  )

  const defaultCurrency = ref<Currency | null>(null)

  // Initialize with current currency code
  function initializeCurrency(): void {
    try {
      defaultCurrency.value = Currency.of(defaultCurrencyCode.value)
    } catch {
      // Fallback to USD if invalid
      defaultCurrencyCode.value = DEFAULT_CURRENCY
      defaultCurrency.value = Currency.of(DEFAULT_CURRENCY)
    }
  }

  async function hydrateFromBackend() {
    try {
      const s = await settingsApi.get()
      if (s?.defaultCurrency) {
        defaultCurrencyCode.value = s.defaultCurrency
        defaultCurrency.value = Currency.of(s.defaultCurrency)
        localStorage.setItem(STORAGE_KEY_DEFAULT_CURRENCY, defaultCurrencyCode.value)
      }
    } catch {
      // Fallback to local value
      initializeCurrency()
    }
  }

  async function setDefaultCurrency(currencyCode: string) {
    try {
      const currency = Currency.of(currencyCode || DEFAULT_CURRENCY)
      defaultCurrencyCode.value = currency.getCode()
      defaultCurrency.value = currency
      localStorage.setItem(STORAGE_KEY_DEFAULT_CURRENCY, defaultCurrencyCode.value)
      await settingsApi.updateCurrency(defaultCurrencyCode.value)
    } catch (error) {
      console.error('Invalid currency code:', currencyCode)
      // Fallback to current value
      throw new Error(`Invalid currency code: ${currencyCode}`)
    }
  }

  async function reset() {
    defaultCurrencyCode.value = DEFAULT_CURRENCY
    defaultCurrency.value = Currency.of(DEFAULT_CURRENCY)
    localStorage.setItem(STORAGE_KEY_DEFAULT_CURRENCY, defaultCurrencyCode.value)
    try {
      await settingsApi.reset()
    } catch {
      // Ignore errors on reset
    }
  }

  return {
    defaultCurrencyCode,
    defaultCurrency,
    initializeCurrency,
    hydrateFromBackend,
    setDefaultCurrency,
    reset
  }
}) 