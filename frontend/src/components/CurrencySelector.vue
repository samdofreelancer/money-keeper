<template>
  <el-select
    v-model="selectedCode"
    filterable
    remote
    clearable
    placeholder="Search by code, name, symbol"
    :remote-method="remoteMethod"
    :loading="loading"
    @change="handleChange"
    size="small"
    class="currency-select"
  >
    <el-option
      v-for="currency in filteredCurrencies"
      :key="currency.code"
      :label="currency.name"
      :value="currency.code"
    >
      <template #default>
        <div class="currency-item">
          <img :src="currency.flag" alt="flag" class="flag" />
          <div class="currency-info">
            <div class="currency-name">{{ currency.name }}</div>
            <div class="currency-code">{{ currency.code }}</div>
          </div>
          <div class="currency-symbol">{{ currency.symbol }}</div>
        </div>
      </template>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'

interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
}

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  currencies: {
    type: Array as PropType<Currency[]>,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedCode = ref(props.modelValue)
const loading = ref(false)
const filteredCurrencies = ref(props.currencies)

watch(() => props.modelValue, (newVal) => {
  selectedCode.value = newVal
})

watch(() => props.currencies, (newVal) => {
  filteredCurrencies.value = newVal
})

function remoteMethod(query: string) {
  if (!query) {
    filteredCurrencies.value = props.currencies
    return
  }
  const q = query.toLowerCase()
  filteredCurrencies.value = props.currencies.filter(c =>
    c.code.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q) ||
    c.symbol.toLowerCase().includes(q)
  )
}

function handleChange(value: string) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.currency-select {
  width: 100%;
}

.currency-item {
  display: flex;
  align-items: center;
}

.flag {
  width: 32px;
  height: 20px;
  border-radius: 2px;
  margin-right: 12px;
  object-fit: cover;
}

.currency-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.currency-name {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.currency-code {
  font-size: 12px;
  color: #909399;
}

.currency-symbol {
  font-weight: 600;
  font-size: 14px;
  color: #606266;
  margin-left: 20px;
  white-space: nowrap;
  overflow: visible;
  min-width: 20px;
}
</style>
