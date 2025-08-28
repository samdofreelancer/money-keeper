<template>
  <div class="page-container" data-testid="settings-page">
    <el-card shadow="never">
      <h2>General settings</h2>
      <el-form label-width="160px">
        <el-form-item label="Currency">
          <a href="javascript:void(0)" @click="openDialog" data-testid="link-default-currency">
            <img v-if="currentCurrency?.flag" :src="currentCurrency.flag" alt="flag" class="flag" />
            {{ displayCurrencyName }}
          </a>
        </el-form-item>
      </el-form>

      <el-dialog v-model="dialogVisible" title="Select currency" width="520px">
        <CurrencySelector
          v-model="draftCurrency"
          :currencies="supportedCurrencies"
        />
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click="applyCurrency">Save</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import CurrencySelector from '@/components/CurrencySelector.vue'
import { currencyApi } from '@/api/currency'

const settings = useSettingsStore()
const selectedCurrency = ref(settings.defaultCurrency)
const draftCurrency = ref(settings.defaultCurrency)
const supportedCurrencies = ref<any[]>([])
const dialogVisible = ref(false)

const currentCurrency = computed(() => supportedCurrencies.value.find((x: any) => x.code === selectedCurrency.value))
const displayCurrencyName = computed(() => currentCurrency.value ? `${currentCurrency.value.name}` : selectedCurrency.value)

watch(() => settings.defaultCurrency, (val) => {
  selectedCurrency.value = val
})

onMounted(async () => {
  await settings.hydrateFromBackend()
  selectedCurrency.value = settings.defaultCurrency
  supportedCurrencies.value = await currencyApi.getSupportedCurrencies()
})

function openDialog() {
  draftCurrency.value = selectedCurrency.value
  dialogVisible.value = true
}

async function applyCurrency() {
  await settings.setDefaultCurrency(draftCurrency.value)
  selectedCurrency.value = settings.defaultCurrency
  dialogVisible.value = false
}
</script>

<style scoped>
.dialog-footer { display: inline-flex; gap: 8px; }
.flag { width: 22px; height: 14px; border-radius: 2px; margin-right: 8px; vertical-align: text-bottom; }
</style> 