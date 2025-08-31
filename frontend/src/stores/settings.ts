import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsApi } from '@/api/settings'

const DEFAULT_CURRENCY = 'USD'
const STORAGE_KEY_DEFAULT_CURRENCY = 'default_currency'

export const useSettingsStore = defineStore('settings', () => {
  const defaultCurrency = ref<string>(
    localStorage.getItem(STORAGE_KEY_DEFAULT_CURRENCY) || DEFAULT_CURRENCY
  )

  async function hydrateFromBackend() {
    try {
      const s = await settingsApi.get()
      if (s?.defaultCurrency) {
        defaultCurrency.value = s.defaultCurrency
        localStorage.setItem(STORAGE_KEY_DEFAULT_CURRENCY, defaultCurrency.value)
      }
    } catch {
      // ignore, fallback to local value
    }
  }

  async function setDefaultCurrency(currencyCode: string) {
    defaultCurrency.value = currencyCode || DEFAULT_CURRENCY
    localStorage.setItem(STORAGE_KEY_DEFAULT_CURRENCY, defaultCurrency.value)
    try {
      await settingsApi.updateCurrency(defaultCurrency.value)
    } catch {
      // keep local value even if backend call fails
    }
  }

  async function reset() {
    defaultCurrency.value = DEFAULT_CURRENCY
    localStorage.setItem(STORAGE_KEY_DEFAULT_CURRENCY, defaultCurrency.value)
    try {
      await settingsApi.reset()
    } catch {
      // ignore
    }
  }

  return {
    defaultCurrency,
    hydrateFromBackend,
    setDefaultCurrency,
    reset
  }
}) 