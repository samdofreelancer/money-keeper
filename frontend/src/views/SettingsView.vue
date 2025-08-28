<template>
  <div class="page-container" data-testid="settings-page">
    <el-card shadow="never">
      <h2>General settings</h2>
      <el-form label-width="160px">
        <el-form-item label="Default currency">
          <CurrencySelector
            v-model="selectedCurrency"
            :currencies="supportedCurrencies"
          />
        </el-form-item>
      </el-form>
      <div class="actions">
        <el-button type="primary" @click="save">Save</el-button>
        <el-button @click="reset">Reset</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import CurrencySelector from '@/components/CurrencySelector.vue'
import { currencyApi } from '@/api/currency'

const settings = useSettingsStore()
const selectedCurrency = ref(settings.defaultCurrency)
const supportedCurrencies = ref<any[]>([])

watch(() => settings.defaultCurrency, (val) => {
  selectedCurrency.value = val
})

onMounted(async () => {
  await settings.hydrateFromBackend()
  selectedCurrency.value = settings.defaultCurrency
  supportedCurrencies.value = await currencyApi.getSupportedCurrencies()
})

async function save() {
  await settings.setDefaultCurrency(selectedCurrency.value)
}

async function reset() {
  await settings.reset()
  selectedCurrency.value = settings.defaultCurrency
}
</script>

<style scoped>
.actions { margin-top: 16px; }
</style> 