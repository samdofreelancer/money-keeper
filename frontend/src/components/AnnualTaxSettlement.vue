<template>
  <div class="annual-settlement-container">
    <div class="card">
      <h1>Quyết Toán Thuế Năm</h1>
      
      <div class="form-section">
        <h2>Thông Tin Nhập Liệu</h2>
        
        <div class="form-group">
          <label for="year">Năm Quyết Toán:</label>
          <input 
            v-model="form.year" 
            type="number" 
            id="year" 
            placeholder="2025"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="totalGrossSalary">Tổng Lương Gross (năm):</label>
            <input 
              v-model.number="form.totalGrossSalary" 
              type="number" 
              id="totalGrossSalary"
              placeholder="0"
              class="form-input"
              @input="formatInput"
            />
            <span class="value-display">{{ formatCurrency(form.totalGrossSalary) }}</span>
          </div>

          <div class="form-group">
            <label for="totalBonus">Tổng Thưởng (năm):</label>
            <input 
              v-model.number="form.totalBonus" 
              type="number" 
              id="totalBonus"
              placeholder="0"
              class="form-input"
              @input="formatInput"
            />
            <span class="value-display">{{ formatCurrency(form.totalBonus) }}</span>
          </div>
        </div>

        <div class="divider">Khấu Trừ Giảm Trừ</div>

        <div class="form-row">
          <div class="form-group">
            <label for="personalDeduction">Khấu Trừ Bản Thân:</label>
            <input 
              v-model.number="form.personalDeduction" 
              type="number" 
              id="personalDeduction"
              placeholder="15500000"
              class="form-input"
              @input="formatInput"
            />
            <span class="value-display">{{ formatCurrency(form.personalDeduction) }}</span>
          </div>

          <div class="form-group">
            <label for="dependentDeduction">Khấu Trừ/Người Phụ Thuộc:</label>
            <input 
              v-model.number="form.dependentDeduction" 
              type="number" 
              id="dependentDeduction"
              placeholder="6200000"
              class="form-input"
              @input="formatInput"
            />
            <span class="value-display">{{ formatCurrency(form.dependentDeduction) }}</span>
          </div>

          <div class="form-group">
            <label for="numberOfDependents">Số Người Phụ Thuộc:</label>
            <input 
              v-model.number="form.numberOfDependents" 
              type="number" 
              id="numberOfDependents"
              min="0"
              max="10"
              placeholder="0"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="taxFreeAllowance">Phụ Cấp Không Chịu Thuế:</label>
            <input 
              v-model.number="form.taxFreeAllowance" 
              type="number" 
              id="taxFreeAllowance"
              placeholder="0"
              class="form-input"
              @input="formatInput"
            />
            <span class="value-display">{{ formatCurrency(form.taxFreeAllowance) }}</span>
          </div>

          <div class="form-group">
            <label for="otherDeduction">Khấu Trừ Khác:</label>
            <input 
              v-model.number="form.otherDeduction" 
              type="number" 
              id="otherDeduction"
              placeholder="0"
              class="form-input"
              @input="formatInput"
            />
            <span class="value-display">{{ formatCurrency(form.otherDeduction) }}</span>
          </div>
        </div>

        <div class="divider">Đóng Góp Bảo Hiểm</div>

        <div class="form-row">
          <div class="form-group">
            <label for="bhxhContribution">BHXH (năm):</label>
            <input 
              v-model.number="form.bhxhContribution" 
              type="number" 
              id="bhxhContribution"
              placeholder="0"
              class="form-input"
              @input="formatInput"
            />
            <span class="value-display">{{ formatCurrency(form.bhxhContribution) }}</span>
          </div>

          <div class="form-group">
            <label for="bhytContribution">BHYT (năm):</label>
            <input 
              v-model.number="form.bhytContribution" 
              type="number" 
              id="bhytContribution"
              placeholder="0"
              class="form-input"
              @input="formatInput"
            />
            <span class="value-display">{{ formatCurrency(form.bhytContribution) }}</span>
          </div>

          <div class="form-group">
            <label for="bhtnContribution">BHTN (năm):</label>
            <input 
              v-model.number="form.bhtnContribution" 
              type="number" 
              id="bhtnContribution"
              placeholder="0"
              class="form-input"
              @input="formatInput"
            />
            <span class="value-display">{{ formatCurrency(form.bhtnContribution) }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="taxAlreadyPaid">Thuế Đã Nộp Trong Năm:</label>
          <input 
            v-model.number="form.taxAlreadyPaid" 
            type="number" 
            id="taxAlreadyPaid"
            placeholder="0"
            class="form-input"
            @input="formatInput"
          />
          <span class="value-display">{{ formatCurrency(form.taxAlreadyPaid) }}</span>
        </div>

        <button @click="calculateSettlement" class="btn btn-primary">
          Tính Toán Quyết Toán Thuế
        </button>
      </div>

      <!-- Results Section -->
      <div v-if="result" class="results-section">
        <h2>Kết Quả Quyết Toán</h2>

        <div class="result-grid">
          <div class="result-item">
            <span class="label">Tổng Thu Nhập:</span>
            <span class="value">{{ formatCurrency(result.totalIncome) }}</span>
          </div>

          <div class="result-item">
            <span class="label">Tổng Khấu Trừ:</span>
            <span class="value">{{ formatCurrency(result.totalDeductions) }}</span>
          </div>

          <div class="result-item">
            <span class="label">Thu Nhập Chịu Thuế:</span>
            <span class="value highlight">{{ formatCurrency(result.taxableIncome) }}</span>
          </div>

          <div class="result-item">
            <span class="label">Thuế Tính Toán:</span>
            <span class="value">{{ formatCurrency(result.calculatedTax) }}</span>
          </div>

          <div class="result-item">
            <span class="label">Đóng Góp Bảo Hiểm:</span>
            <span class="value">{{ formatCurrency(result.insuranceContributions) }}</span>
          </div>

          <div class="result-item">
            <span class="label">Thuế Đã Nộp:</span>
            <span class="value">{{ formatCurrency(result.taxAlreadyPaid) }}</span>
          </div>
        </div>

        <div class="settlement-status" :class="result.settlementStatus">
          <div v-if="result.settlementStatus === 'due'" class="status-due">
            <h3>💸 Phải Nộp Thuế</h3>
            <p class="amount">{{ formatCurrency(Math.abs(result.taxDue)) }}</p>
          </div>
          <div v-else-if="result.settlementStatus === 'refund'" class="status-refund">
            <h3>✅ Được Hoàn Lại</h3>
            <p class="amount">{{ formatCurrency(Math.abs(result.taxDue)) }}</p>
          </div>
          <div v-else class="status-balanced">
            <h3>⚖️ Cân Bằng</h3>
            <p class="amount">0 VNĐ</p>
          </div>
        </div>

        <div class="breakdown">
          <h3>Chi Tiết Khấu Trừ</h3>
          <ul>
            <li>
              <span>Khấu Trừ Bản Thân:</span>
              <span>{{ formatCurrency(result.personalDeductionApplied) }}</span>
            </li>
            <li>
              <span>Khấu Trừ Người Phụ Thuộc:</span>
              <span>{{ formatCurrency(result.dependentDeductionApplied) }}</span>
            </li>
            <li>
              <span>Khấu Trừ Khác:</span>
              <span>{{ formatCurrency(result.otherDeductionApplied) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Error Section -->
      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface AnnualTaxSettlementResult {
  year: string
  totalIncome: number
  totalDeductions: number
  taxableIncome: number
  calculatedTax: number
  taxAlreadyPaid: number
  taxDue: number
  settlementStatus: 'due' | 'refund' | 'balanced'
  personalDeductionApplied: number
  dependentDeductionApplied: number
  otherDeductionApplied: number
  insuranceContributions: number
}

const form = ref({
  year: new Date().getFullYear().toString(),
  totalGrossSalary: 0,
  totalBonus: 0,
  personalDeduction: 15500000,
  dependentDeduction: 6200000,
  numberOfDependents: 0,
  taxFreeAllowance: 0,
  otherDeduction: 0,
  bhxhContribution: 0,
  bhytContribution: 0,
  bhtnContribution: 0,
  taxAlreadyPaid: 0,
})

const result = ref<AnnualTaxSettlementResult | null>(null)
const error = ref('')

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatInput = () => {
  // Format input fields for better UX
}

const calculateSettlement = async () => {
  error.value = ''
  result.value = null

  try {
    const response = await fetch('/api/tax/annual-settlement/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.value),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      error.value = errorData.message || 'Lỗi khi tính toán quyết toán thuế'
      return
    }

    result.value = await response.json()
  } catch (err) {
    error.value = 'Lỗi kết nối với server. Vui lòng thử lại.'
    console.error('Error:', err)
  }
}
</script>

<style scoped>
.annual-settlement-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

h1 {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
}

h2 {
  font-size: 20px;
  margin-top: 20px;
  margin-bottom: 15px;
  color: #555;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

h3 {
  font-size: 16px;
  margin: 0;
  color: #666;
}

.form-section {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.25);
}

.value-display {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.divider {
  font-size: 14px;
  font-weight: 600;
  color: #007bff;
  margin: 25px 0 15px 0;
  padding: 10px 0;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  width: 100%;
  margin-top: 20px;
}

.btn-primary:hover {
  background-color: #0056b3;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.results-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #eee;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.result-item .label {
  font-weight: 600;
  color: #555;
  margin: 0;
}

.result-item .value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.result-item .value.highlight {
  color: #007bff;
}

.settlement-status {
  margin: 30px 0;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.settlement-status.due {
  background: #fff3cd;
  border: 2px solid #ffc107;
  color: #856404;
}

.settlement-status.refund {
  background: #d4edda;
  border: 2px solid #28a745;
  color: #155724;
}

.settlement-status.balanced {
  background: #d1ecf1;
  border: 2px solid #17a2b8;
  color: #0c5460;
}

.settlement-status h3 {
  margin: 0 0 10px 0;
  font-size: 22px;
}

.settlement-status .amount {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.breakdown {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
  margin-top: 20px;
}

.breakdown ul {
  list-style: none;
  padding: 0;
  margin: 15px 0 0 0;
}

.breakdown li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.breakdown li:last-child {
  border-bottom: none;
}

.breakdown li span:first-child {
  font-weight: 500;
  color: #555;
}

.breakdown li span:last-child {
  font-weight: 700;
  color: #333;
}

.alert {
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.alert-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}
</style>
