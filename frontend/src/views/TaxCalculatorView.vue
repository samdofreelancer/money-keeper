<template>
  <div class="tax-calculator-container">
    <!-- Header -->
    <div class="calculator-header">
      <h1>💰 Công cụ Tính Thuế Thu nhập Cá nhân</h1>
      <p>Tính toán lương ròng (Net) từ lương brutto (Gross)</p>
    </div>

    <!-- Tabs -->
    <div class="tabs-wrapper">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'calculator' }"
        @click="activeTab = 'calculator'"
      >
        🔢 Tính Toán
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'results' }"
        @click="activeTab = 'results'"
      >
        📊 Kết Quả
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'reference' }"
        @click="activeTab = 'reference'"
      >
        📋 Tham Khảo
      </button>
    </div>

    <!-- Calculator Tab -->
    <div v-if="activeTab === 'calculator'" class="tab-content">
      <div class="info-box">
        ℹ️ Công cụ tính toán theo quy định thuế thu nhập cá nhân tại Việt Nam. Kết quả chỉ mang tính chất tham khảo.
      </div>

      <form class="calculator-form">
        <!-- Tax Bracket Selection -->
        <div class="form-group">
          <label>
            Biểu thuế TNCN
            <span class="label-subtitle">Chọn biểu áp dụng</span>
          </label>
          <select v-model="formData.taxBracketType" class="form-select">
            <option value="7-bracket">7 bậc (13/12/2025 - 30/6/2026)</option>
            <option value="5-bracket">5 bậc (Từ 01/7/2026 trở đi)</option>
          </select>
        </div>

        <!-- Salary Section -->
        <h4 class="section-header">Lương</h4>
        <div class="form-group">
          <label>
            Lương Gross
            <span class="label-subtitle">(Trước khấu trừ)</span>
          </label>
          <div class="input-wrapper">
            <input 
              v-model="formData.grossSalary" 
              type="text" 
              placeholder="0"
              @input="formatInputCurrency"
              class="form-input"
            >
            <span class="currency-unit">₫</span>
          </div>
        </div>

        <div class="form-group">
          <label>
            Thưởng Tết
            <span class="label-subtitle">Sẽ tính thuế riêng theo bảng lũy tiến</span>
          </label>
          <div class="input-wrapper">
            <input 
              v-model="formData.tetBonus" 
              type="text" 
              placeholder="0"
              @input="formatInputCurrency"
              class="form-input"
            >
            <span class="currency-unit">₫</span>
          </div>
        </div>

        <!-- Deduction Section -->
        <h4 class="section-header">Khấu Trừ</h4>
        <div class="form-group">
          <label>
            Biểu khấu trừ gia cảnh
            <span class="label-subtitle">Chọn theo thời kỳ áp dụng</span>
          </label>
          <select v-model="formData.deductionBracket" @change="updateDeductionValues" class="form-select">
            <option value="old">13/12/2025 - 31/12/2025: Cá nhân 11M, Phụ thuộc 4.4M</option>
            <option value="new">Từ 01/01/2026: Cá nhân 15.5M, Phụ thuộc 6.2M</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>
              Khấu trừ cá nhân
              <span class="label-subtitle">Mặc định: 11.000.000 VND</span>
            </label>
            <div class="input-wrapper">
              <input 
                v-model="formData.personalDeduction" 
                type="text" 
                placeholder="0"
                @input="formatInputCurrency"
                class="form-input"
              >
            </div>
          </div>
          <div class="form-group">
            <label>
              Số người phụ thuộc
              <span class="label-subtitle">(Tối đa 10 người)</span>
            </label>
            <div class="input-wrapper">
              <input 
                v-model.number="formData.dependents" 
                type="number" 
                min="0" 
                max="10"
                @input="calculateSalary"
                class="form-input"
              >
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>
            Khấu trừ mỗi người phụ thuộc
            <span class="label-subtitle">Mặc định: 4.400.000 VND</span>
          </label>
          <div class="input-wrapper">
            <input 
              v-model="formData.dependentDeductionPerPerson" 
              type="text" 
              placeholder="0"
              @input="formatInputCurrency"
              class="form-input"
            >
          </div>
        </div>

        <!-- Insurance Section -->
        <h4 class="section-header">Bảo Hiểm</h4>
        <div class="form-group">
          <label>
            Lương cơ sở đóng BHXH
            <span class="label-subtitle">(Mặc định: 46.800.000 VND = 20 × 2.340.000)</span>
          </label>
          <div class="input-wrapper">
            <input 
              v-model="formData.insuranceBase" 
              type="text" 
              placeholder="0"
              @input="formatInputCurrency"
              class="form-input"
            >
            <span class="currency-unit">₫</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>
              Tỷ lệ BHXH (%)
              <span class="label-subtitle">Bảo hiểm Xã hội</span>
            </label>
            <div class="input-wrapper">
              <input 
                v-model.number="formData.bhxhRate" 
                type="number" 
                min="0" 
                max="100" 
                step="0.1"
                @input="calculateSalary"
                class="form-input"
              >
              <span>%</span>
            </div>
          </div>
          <div class="form-group">
            <label>
              Tỷ lệ BHYT (%)
              <span class="label-subtitle">Bảo hiểm Y tế</span>
            </label>
            <div class="input-wrapper">
              <input 
                v-model.number="formData.bhytRate" 
                type="number" 
                min="0" 
                max="100" 
                step="0.1"
                @input="calculateSalary"
                class="form-input"
              >
              <span>%</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>
            Vùng lương
            <span class="label-subtitle">Để tính trần BHTN</span>
          </label>
          <select v-model="formData.wageZone" @change="calculateSalary" class="form-select">
            <option value="I">Vùng I (HN, TP.HCM): 4.960.000 → Trần: 99.200.000</option>
            <option value="II">Vùng II: 4.410.000 → Trần: 88.200.000</option>
            <option value="III">Vùng III: 3.860.000 → Trần: 77.200.000</option>
            <option value="IV">Vùng IV: 3.450.000 → Trần: 69.000.000</option>
          </select>
        </div>

        <div class="form-group">
          <label>
            Tỷ lệ BHTN (%)
            <span class="label-subtitle">Bảo hiểm Thất nghiệp</span>
          </label>
          <div class="input-wrapper">
            <input 
              v-model.number="formData.bhtnRate" 
              type="number" 
              min="0" 
              max="100" 
              step="0.1"
              @input="calculateSalary"
              class="form-input"
            >
            <span>%</span>
          </div>
        </div>

        <!-- Allowance Section -->
        <h4 class="section-header">Phụ Cấp Không Tính Thuế</h4>
        <div class="form-group">
          <label>
            Phụ cấp (ăn trưa, đi lại, v.v.)
            <span class="label-subtitle">Mặc định: 1.200.000 VND</span>
          </label>
          <div class="input-wrapper">
            <input 
              v-model="formData.taxFreeAllowance" 
              type="text" 
              placeholder="0"
              @input="formatInputCurrency"
              class="form-input"
            >
            <span class="currency-unit">₫</span>
          </div>
        </div>

        <div class="form-group">
          <label>
            Khoản Trừ (truy thu, rớt chứng chỉ, v.v.)
            <span class="label-subtitle">Sẽ trừ trực tiếp từ lương net</span>
          </label>
          <div class="input-wrapper">
            <input 
              v-model="formData.otherDeduction" 
              type="text" 
              placeholder="0"
              @input="formatInputCurrency"
              class="form-input"
            >
            <span class="currency-unit">₫</span>
          </div>
        </div>

        <!-- Buttons -->
        <div class="button-group">
          <button type="button" class="btn-calculate" @click="calculateSalary">
            Tính Thuế
          </button>
          <button type="button" class="btn-reset" @click="resetForm">
            Reset
          </button>
        </div>
      </form>
    </div>

    <!-- Results Tab -->
    <div v-if="activeTab === 'results'" class="tab-content results-content">
      <div v-if="!hasResults" class="info-box">
        ℹ️ Vui lòng nhấn nút "Tính Toán" để xem kết quả tại đây.
      </div>
      <div v-else class="results-card">
        <div class="result-item">
          <label>Lương Gross</label>
          <span class="value">{{ formatCurrency(results.grossSalary) }} <span class="currency-symbol">₫</span></span>
        </div>

        <div class="breakdown">
          <h3>Các khoản khấu trừ</h3>
          <div class="breakdown-item">
            <span class="label">BHXH ({{ formData.bhxhRate }}%):</span>
            <span class="value">{{ formatCurrency(results.bhxh) }} <span class="currency-symbol">₫</span></span>
          </div>
          <div class="breakdown-item">
            <span class="label">BHYT ({{ formData.bhytRate }}%):</span>
            <span class="value">{{ formatCurrency(results.bhyt) }} <span class="currency-symbol">₫</span></span>
          </div>
          <div class="breakdown-item">
            <span class="label">BHTN ({{ formData.bhtnRate }}%):</span>
            <span class="value">{{ formatCurrency(results.bhtn) }} <span class="currency-symbol">₫</span></span>
          </div>
        </div>

        <div class="result-item">
          <label>Thu nhập chịu thuế</label>
          <span class="value">{{ formatCurrency(results.taxableIncome) }} <span class="currency-symbol">₫</span></span>
        </div>

        <div class="result-item">
          <label>Thuế TNCN phải nộp</label>
          <span class="value">{{ formatCurrency(results.totalTax) }} <span class="currency-symbol">₫</span></span>
        </div>

        <div class="result-item">
          <label>Lương Net tháng (sau thuế)</label>
          <span class="value">{{ formatCurrency(results.netBeforeAllowance) }} <span class="currency-symbol">₫</span></span>
        </div>

        <div class="breakdown">
          <h3>Điều chỉnh Lương Net</h3>
          <div class="breakdown-item">
            <span class="label">+ Phụ cấp (ăn trưa, đi lại):</span>
            <span class="value">{{ formatCurrency(results.taxFreeAllowance) }} <span class="currency-symbol">₫</span></span>
          </div>
          <div class="breakdown-item">
            <span class="label">- Khoản trừ (truy thu, rớt chứng chỉ):</span>
            <span class="value">{{ formatCurrency(results.otherDeduction) }} <span class="currency-symbol">₫</span></span>
          </div>
        </div>

        <div class="result-item">
          <label>Lương Net tháng (cộng trừ)</label>
          <span class="value">{{ formatCurrency(results.netMonthly) }} <span class="currency-symbol">₫</span></span>
        </div>

        <div class="breakdown">
          <h3>Thưởng</h3>
          <div class="breakdown-item">
            <span class="label">Tiền Thưởng:</span>
            <span class="value">{{ formatCurrency(results.tetBonus) }} <span class="currency-symbol">₫</span></span>
          </div>
          <div class="breakdown-item">
            <span class="label">Thuế Thưởng:</span>
            <span class="value">{{ formatCurrency(results.bonusTax) }} <span class="currency-symbol">₫</span></span>
          </div>
          <div class="breakdown-item">
            <span class="label">Thưởng Net (sau thuế):</span>
            <span class="value">{{ formatCurrency(results.netBonus) }} <span class="currency-symbol">₫</span></span>
          </div>
        </div>

        <div class="result-item highlight">
          <label>🎯 Tổng Lương Net (Tháng + Thưởng)</label>
          <span class="value">{{ formatCurrency(results.totalNetSalary) }} <span class="currency-symbol">₫</span></span>
        </div>
      </div>
    </div>

    <!-- Reference Tab -->
    <div v-if="activeTab === 'reference'" class="tab-content reference-content">
      <div class="reference-section">
        <h3>📊 Biểu Thuế TNCN Lũy Tiến</h3>
        
        <h4>7 Bậc (13/12/2025 - 30/6/2026)</h4>
        <table class="reference-table">
          <tr>
            <th>Bậc</th>
            <th>Khoảng thu nhập/tháng</th>
            <th>Suất thuế</th>
          </tr>
          <tr><td>1</td><td>0 - 5.000.000</td><td>5%</td></tr>
          <tr><td>2</td><td>5.000.001 - 10.000.000</td><td>10%</td></tr>
          <tr><td>3</td><td>10.000.001 - 18.000.000</td><td>15%</td></tr>
          <tr><td>4</td><td>18.000.001 - 32.000.000</td><td>20%</td></tr>
          <tr><td>5</td><td>32.000.001 - 52.000.000</td><td>25%</td></tr>
          <tr><td>6</td><td>52.000.001 - 80.000.000</td><td>30%</td></tr>
          <tr><td>7</td><td>Trên 80.000.000</td><td>35%</td></tr>
        </table>

        <h4 style="margin-top: 20px;">5 Bậc (Từ 01/7/2026 trở đi)</h4>
        <table class="reference-table">
          <tr>
            <th>Bậc</th>
            <th>Khoảng thu nhập/tháng</th>
            <th>Suất thuế</th>
          </tr>
          <tr><td>1</td><td>0 - 10.000.000</td><td>5%</td></tr>
          <tr><td>2</td><td>10.000.001 - 30.000.000</td><td>10%</td></tr>
          <tr><td>3</td><td>30.000.001 - 60.000.000</td><td>20%</td></tr>
          <tr><td>4</td><td>60.000.001 - 100.000.000</td><td>30%</td></tr>
          <tr><td>5</td><td>Trên 100.000.000</td><td>35%</td></tr>
        </table>
      </div>

      <div class="reference-section">
        <h3>💰 Khấu Trừ Gia Cảnh</h3>
        <p><strong>13/12/2025 - 31/12/2025:</strong></p>
        <ul>
          <li>Cá nhân: <strong>11.000.000 VND/tháng</strong></li>
          <li>Người phụ thuộc: <strong>4.400.000 VND/tháng</strong> (mỗi người, tối đa 10 người)</li>
        </ul>
        <p><strong>Từ 01/01/2026 trở đi:</strong></p>
        <ul>
          <li>Cá nhân: <strong>15.500.000 VND/tháng</strong></li>
          <li>Người phụ thuộc: <strong>6.200.000 VND/tháng</strong> (mỗi người, tối đa 10 người)</li>
        </ul>
      </div>

      <div class="reference-section">
        <h3>🏥 Tỷ Lệ Bảo Hiểm Xã Hội (2025)</h3>
        <p><strong>Cơ sở tính bảo hiểm:</strong></p>
        <ul>
          <li><strong>Trần BHXH/BHYT: 46.800.000 VND/tháng</strong> (= 20 × 2.340.000)</li>
        </ul>
        <p><strong>Tỷ lệ đóng (người lao động + công ty):</strong></p>
        <ul>
          <li>BHXH: <strong>8% + 17.5%</strong></li>
          <li>BHYT: <strong>1.5% + 3%</strong></li>
          <li>BHTN: <strong>1% + 1%</strong></li>
        </ul>
        <p><strong>Trần BHTN (theo vùng):</strong></p>
        <ul>
          <li>Vùng I (HN, TP.HCM): 4.960.000 → <strong>99.200.000</strong></li>
          <li>Vùng II: 4.410.000 → <strong>88.200.000</strong></li>
          <li>Vùng III: 3.860.000 → <strong>77.200.000</strong></li>
          <li>Vùng IV: 3.450.000 → <strong>69.000.000</strong></li>
        </ul>
      </div>

      <div class="reference-section">
        <h3>💵 Lương Tối Thiểu Vùng (Từ 1/7/2025)</h3>
        <ul>
          <li><strong>Vùng I</strong> (HN, TP.HCM): <strong>4.960.000 VND/tháng</strong></li>
          <li><strong>Vùng II</strong>: <strong>4.410.000 VND/tháng</strong></li>
          <li><strong>Vùng III</strong>: <strong>3.860.000 VND/tháng</strong></li>
          <li><strong>Vùng IV</strong>: <strong>3.450.000 VND/tháng</strong></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { taxCalculatorAPI } from '@/api/tax-calculator'

const activeTab = ref('calculator')
const hasResults = ref(false)
const loading = ref(false)

const formData = ref({
  grossSalary: '60.000.000',
  tetBonus: '0',
  insuranceBase: '46.800.000',
  dependents: 2,
  bhxhRate: 8,
  bhytRate: 1.5,
  bhtnRate: 1,
  personalDeduction: '11.000.000',
  dependentDeductionPerPerson: '4.400.000',
  taxFreeAllowance: '1.200.000',
  otherDeduction: '0',
  taxBracketType: '7-bracket',
  deductionBracket: 'old',
  wageZone: 'I'
})

const results = ref<any>({
  grossSalary: 0,
  bhxh: 0,
  bhyt: 0,
  bhtn: 0,
  totalInsurance: 0,
  incomeAfterInsurance: 0,
  tetBonus: 0,
  totalDeduction: 0,
  taxableIncome: 0,
  totalTax: 0,
  salaryTax: 0,
  bonusTax: 0,
  netBeforeAllowance: 0,
  taxFreeAllowance: 0,
  otherDeduction: 0,
  netMonthly: 0,
  netBonus: 0,
  totalNetSalary: 0
})

// Methods
function parseFormattedCurrency(value: string): number {
  return parseInt(value.replace(/\D/g, '')) || 0
}

function formatInputCurrency(event: any) {
  const input = event.target
  let value = input.value.replace(/\D/g, '')
  
  if (value === '') {
    input.value = ''
    return
  }
  
  const formatted = new Intl.NumberFormat('vi-VN').format(parseInt(value))
  input.value = formatted
}

function formatCurrency(value: number | string): string {
  if (typeof value === 'string') {
    value = parseInt(value.replace(/\D/g, '')) || 0
  }
  return new Intl.NumberFormat('vi-VN').format(value)
}

function updateDeductionValues() {
  if (formData.value.deductionBracket === 'new') {
    formData.value.personalDeduction = '15.500.000'
    formData.value.dependentDeductionPerPerson = '6.200.000'
  } else {
    formData.value.personalDeduction = '11.000.000'
    formData.value.dependentDeductionPerPerson = '4.400.000'
  }
}

async function calculateSalary() {
  loading.value = true
  try {
    const requestData = {
      grossSalary: parseFormattedCurrency(formData.value.grossSalary),
      tetBonus: parseFormattedCurrency(formData.value.tetBonus),
      insuranceBase: parseFormattedCurrency(formData.value.insuranceBase),
      dependents: formData.value.dependents,
      bhxhRate: formData.value.bhxhRate,
      bhytRate: formData.value.bhytRate,
      bhtnRate: formData.value.bhtnRate,
      personalDeduction: parseFormattedCurrency(formData.value.personalDeduction),
      dependentDeductionPerPerson: parseFormattedCurrency(formData.value.dependentDeductionPerPerson),
      taxFreeAllowance: parseFormattedCurrency(formData.value.taxFreeAllowance),
      otherDeduction: parseFormattedCurrency(formData.value.otherDeduction),
      taxBracketType: formData.value.taxBracketType,
      wageZone: formData.value.wageZone
    }
    
    const result = await taxCalculatorAPI.calculateSalary(requestData)
    results.value = result
    hasResults.value = true
    activeTab.value = 'results'
    ElMessage.success('Tính toán thành công')
  } catch (error) {
    console.error('Calculation error:', error)
    ElMessage.error('Lỗi tính toán. Vui lòng kiểm tra dữ liệu đầu vào.')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  formData.value = {
    grossSalary: '60.000.000',
    tetBonus: '0',
    insuranceBase: '46.800.000',
    dependents: 2,
    bhxhRate: 8,
    bhytRate: 1.5,
    bhtnRate: 1,
    personalDeduction: '11.000.000',
    dependentDeductionPerPerson: '4.400.000',
    taxFreeAllowance: '1.200.000',
    otherDeduction: '0',
    taxBracketType: '7-bracket',
    deductionBracket: 'old',
    wageZone: 'I'
  }
  hasResults.value = false
  activeTab.value = 'calculator'
}

// Remove auto-initialization - let user click the button to calculate
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.tax-calculator-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
  padding: 40px;
}

.calculator-header {
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 3px solid #667eea;
  padding-bottom: 20px;
}

.calculator-header h1 {
  color: #333;
  font-size: 28px;
  margin-bottom: 8px;
  font-weight: 600;
}

.calculator-header p {
  color: #666;
  font-size: 14px;
}

.tabs-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  padding: 12px 24px;
  background: none;
  border: none;
  color: #999;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s ease;
  font-size: 14px;
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-button:hover {
  color: #667eea;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.info-box {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #1565c0;
  line-height: 1.5;
}

.calculator-form {
  width: 100%;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 14px;
}

.label-subtitle {
  display: block;
  color: #999;
  font-weight: 400;
  font-size: 12px;
  margin-top: 4px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: white;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.currency-unit {
  color: #666;
  font-weight: 500;
  min-width: 40px;
  text-align: right;
  font-size: 12px;
}

.section-header {
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  margin: 20px 0 16px 0;
  padding: 10px 0;
  border-top: 2px solid #e0e0e0;
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 32px;
  margin-bottom: 32px;
}

button {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-calculate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-calculate:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-reset {
  background: #f0f0f0;
  color: #333;
}

.btn-reset:hover {
  background: #e0e0e0;
}

.results-content {
  padding: 20px 0;
}

.results-card {
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item label {
  color: #666;
  font-weight: 500;
}

.result-item .value {
  color: #333;
  font-weight: 600;
  font-size: 16px;
}

.result-item.highlight {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 12px;
  border-radius: 6px;
  margin: 0 -12px;
  padding-left: 12px;
  padding-right: 12px;
}

.result-item.highlight label {
  font-weight: 700;
  color: #667eea;
}

.result-item.highlight .value {
  color: #667eea;
  font-size: 18px;
}

.breakdown {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e0e0e0;
}

.breakdown h3 {
  color: #333;
  font-size: 16px;
  margin-bottom: 16px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
}

.breakdown-item .label {
  flex: 1;
}

.breakdown-item .value {
  text-align: right;
  min-width: 120px;
}

.currency-symbol {
  color: #999;
  font-size: 12px;
  font-weight: 400;
  margin-left: 2px;
}

.reference-content {
  padding: 20px 0;
}

.reference-section {
  margin-bottom: 30px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.reference-section h3 {
  color: #667eea;
  margin-bottom: 16px;
  font-size: 16px;
}

.reference-section h4 {
  color: #333;
  margin: 12px 0;
  font-size: 14px;
}

.reference-table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}

.reference-table tr {
  border-bottom: 1px solid #ddd;
}

.reference-table th {
  background: #f5f5f5;
  padding: 8px;
  text-align: left;
  font-weight: 600;
  color: #333;
}

.reference-table td {
  padding: 8px;
  color: #666;
}

.reference-section ul {
  list-style: disc;
  margin-left: 20px;
}

.reference-section li {
  margin: 8px 0;
  color: #666;
}

@media (max-width: 768px) {
  .tax-calculator-container {
    padding: 24px;
  }

  .calculator-header h1 {
    font-size: 22px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .button-group {
    grid-template-columns: 1fr;
  }
}
</style>
