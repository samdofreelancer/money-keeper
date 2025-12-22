<template>
  <div class="tax-settings-container">
    <!-- Header -->
    <div class="settings-header">
      <h1>⚙️ Cấu hình Thuế</h1>
      <p>Quản lý cấu hình tính thuế thu nhập cá nhân</p>
      <button class="btn-reset" @click="resetToDefaults">🔄 Reset Về Mặc Định</button>
    </div>

    <!-- Tabs -->
    <div class="tabs-wrapper">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'brackets' }"
        @click="activeTab = 'brackets'"
      >
        📊 Biểu Thuế
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'deductions' }"
        @click="activeTab = 'deductions'"
      >
        🏷️ Khấu Trừ
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'zones' }"
        @click="activeTab = 'zones'"
      >
        🗺️ Vùng Lương
      </button>
    </div>

    <!-- Tax Brackets Tab -->
    <div v-if="activeTab === 'brackets'" class="tab-content">
      <div class="section-title">Biểu Thuế TNCN</div>
      <div class="brackets-container">
        <table class="settings-table">
          <thead>
            <tr>
              <th>Giá trị</th>
              <th>Tên Biểu</th>
              <th>Ngày Hiệu Lực</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="bracket in taxBrackets" :key="bracket.value">
              <tr @click="expandBracket(bracket)" class="bracket-row" :class="{ expanded: expandedBracketValue === bracket.value }">
                <td>{{ bracket.value }}</td>
                <td>{{ bracket.label }}</td>
                <td>{{ bracket.effectiveDate }}</td>
                <td @click.stop>
                  <button class="btn-edit" @click="editBracket(bracket)">Sửa</button>
                  <button class="btn-delete" @click="deleteBracket(bracket.value)">Xóa</button>
                </td>
              </tr>
              <!-- Bracket Details - Displayed below the row -->
              <tr v-if="expandedBracketValue === bracket.value" class="bracket-details-row">
                <td colspan="4">
                  <div class="bracket-details">
                    <h4>Chi tiết Bảng Lũy Tuyến: {{ bracket.label }}</h4>
                    <table class="details-table">
                      <thead>
                        <tr>
                          <th>Bậc</th>
                          <th>Thu nhập từ</th>
                          <th>Thu nhập đến</th>
                          <th>Tỷ lệ thuế (%)</th>
                          <th>Khấu trừ (VND)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="bracket.brackets && bracket.brackets.length > 0" v-for="(detail, index) in bracket.brackets" :key="index">
                          <td>{{ index + 1 }}</td>
                          <td>{{ formatCurrency(detail.minIncome) }}</td>
                          <td>{{ detail.maxIncome ? formatCurrency(detail.maxIncome) : 'Trở lên' }}</td>
                          <td>{{ detail.rate }}%</td>
                          <td>{{ formatCurrency(detail.deduction) }}</td>
                        </tr>
                        <tr v-else>
                          <td colspan="5" style="text-align: center; padding: 20px; color: #999;">
                            Không có dữ liệu chi tiết. Bấm "Chỉnh Sửa Chi Tiết" để thêm bậc lũy tuyến.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <button class="btn-edit-brackets" @click="editBracketDetails(bracket)">Chỉnh Sửa Chi Tiết</button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <button class="btn-add" @click="showAddBracket = true">+ Thêm Biểu Thuế Mới</button>

      <!-- Add/Edit Bracket Modal -->
      <div v-if="showAddBracket" class="modal-overlay" @click="showAddBracket = false">
        <div class="modal-content" @click.stop>
          <h2>{{ editingBracket ? 'Cập Nhật Biểu Thuế' : 'Thêm Biểu Thuế Mới' }}</h2>
          <div class="form-group">
            <label>Giá trị (Value)</label>
            <input v-model="editingBracket.value" type="text" class="form-input" placeholder="VD: 7-bracket">
          </div>
          <div class="form-group">
            <label>Tên Biểu</label>
            <input v-model="editingBracket.label" type="text" class="form-input" placeholder="VD: 7 bậc (...)">
          </div>
          <div class="form-group">
            <label>Ngày Hiệu Lực</label>
            <input v-model="editingBracket.effectiveDate" type="date" class="form-input">
          </div>
          <div class="modal-buttons">
            <button class="btn-save" @click="saveBracket">Lưu</button>
            <button class="btn-cancel" @click="showAddBracket = false">Hủy</button>
          </div>
        </div>
      </div>

      <!-- Edit Bracket Details Modal -->
      <div v-if="showEditBracketDetails" class="modal-overlay" @click="showEditBracketDetails = false">
        <div class="modal-content large-modal" @click.stop>
          <h2>Chỉnh Sửa Chi Tiết Bảng Lũy Tuyến: {{ editingBracket.label }}</h2>
          <div class="bracket-details-editor">
            <table class="edit-details-table">
              <thead>
                <tr>
                  <th>Bậc</th>
                  <th>Thu nhập từ</th>
                  <th>Thu nhập đến</th>
                  <th>Tỷ lệ thuế (%)</th>
                  <th>Khấu trừ (VND)</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(detail, index) in editingBracket.brackets" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td><input v-model.number="detail.minIncome" type="number" class="form-input-small"></td>
                  <td><input v-model.number="detail.maxIncome" type="number" class="form-input-small" placeholder="Để trống = Trở lên"></td>
                  <td><input v-model.number="detail.rate" type="number" class="form-input-small" min="0" max="100"></td>
                  <td><input v-model.number="detail.deduction" type="number" class="form-input-small"></td>
                  <td>
                    <button class="btn-delete-small" @click="removeBracketDetail(index)">Xóa</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <button class="btn-add-small" @click="addBracketDetail">+ Thêm Bậc</button>
          </div>
          <div class="modal-buttons">
            <button class="btn-save" @click="saveBracketDetails">Lưu</button>
            <button class="btn-cancel" @click="showEditBracketDetails = false">Hủy</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Deductions Tab -->
    <div v-if="activeTab === 'deductions'" class="tab-content">
      <div class="section-title">Biểu Khấu Trừ Gia Cảnh</div>
      <table class="settings-table">
        <thead>
          <tr>
            <th>Giá trị</th>
            <th>Tên Biểu</th>
            <th>Khấu Trừ Cá Nhân</th>
            <th>Khấu Trừ Phụ Thuộc</th>
            <th>Ngày Hiệu Lực</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="deduction in deductionBrackets" :key="deduction.value">
            <td>{{ deduction.value }}</td>
            <td>{{ deduction.label }}</td>
            <td>{{ formatCurrency(deduction.personalDeduction) }}</td>
            <td>{{ formatCurrency(deduction.dependentDeduction) }}</td>
            <td>{{ deduction.effectiveDate }}</td>
            <td>
              <button class="btn-edit" @click="editDeduction(deduction)">Sửa</button>
              <button class="btn-delete" @click="deleteDeduction(deduction.value)">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button class="btn-add" @click="showAddDeduction = true">+ Thêm Biểu Khấu Trừ Mới</button>

      <!-- Add/Edit Deduction Modal -->
      <div v-if="showAddDeduction" class="modal-overlay" @click="showAddDeduction = false">
        <div class="modal-content" @click.stop>
          <h2>{{ editingDeduction ? 'Cập Nhật Biểu Khấu Trừ' : 'Thêm Biểu Khấu Trừ Mới' }}</h2>
          <div class="form-group">
            <label>Giá trị (Value)</label>
            <input v-model="editingDeduction.value" type="text" class="form-input" placeholder="VD: old">
          </div>
          <div class="form-group">
            <label>Tên Biểu</label>
            <input v-model="editingDeduction.label" type="text" class="form-input" placeholder="VD: Từ 01/01/2026 (...)">
          </div>
          <div class="form-group">
            <label>Khấu Trừ Cá Nhân (VND)</label>
            <input v-model.number="editingDeduction.personalDeduction" type="number" class="form-input" placeholder="VD: 15500000">
          </div>
          <div class="form-group">
            <label>Khấu Trừ Phụ Thuộc (VND)</label>
            <input v-model.number="editingDeduction.dependentDeduction" type="number" class="form-input" placeholder="VD: 6200000">
          </div>
          <div class="form-group">
            <label>Ngày Hiệu Lực</label>
            <input v-model="editingDeduction.effectiveDate" type="date" class="form-input">
          </div>
          <div class="modal-buttons">
            <button class="btn-save" @click="saveDeduction">Lưu</button>
            <button class="btn-cancel" @click="showAddDeduction = false">Hủy</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Wage Zones Tab -->
    <div v-if="activeTab === 'zones'" class="tab-content">
      <div class="section-title">Vùng Lương</div>
      <table class="settings-table">
        <thead>
          <tr>
            <th>Giá trị</th>
            <th>Tên Vùng</th>
            <th>Lương Tối Thiểu</th>
            <th>Trần BHTN</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="zone in wageZones" :key="zone.value">
            <td>{{ zone.value }}</td>
            <td>{{ zone.label }}</td>
            <td>{{ formatCurrency(zone.minimumWage) }}</td>
            <td>{{ formatCurrency(zone.bhtnCeiling) }}</td>
            <td>
              <button class="btn-edit" @click="editZone(zone)">Sửa</button>
              <button class="btn-delete" @click="deleteZone(zone.value)">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button class="btn-add" @click="showAddZone = true">+ Thêm Vùng Lương Mới</button>

      <!-- Add/Edit Zone Modal -->
      <div v-if="showAddZone" class="modal-overlay" @click="showAddZone = false">
        <div class="modal-content" @click.stop>
          <h2>{{ editingZone ? 'Cập Nhật Vùng Lương' : 'Thêm Vùng Lương Mới' }}</h2>
          <div class="form-group">
            <label>Giá trị (Value)</label>
            <input v-model="editingZone.value" type="text" class="form-input" placeholder="VD: I, II, III, IV">
          </div>
          <div class="form-group">
            <label>Tên Vùng</label>
            <input v-model="editingZone.label" type="text" class="form-input" placeholder="VD: Vùng I (HN, TP.HCM) (...)">
          </div>
          <div class="form-group">
            <label>Lương Tối Thiểu (VND)</label>
            <input v-model.number="editingZone.minimumWage" type="number" class="form-input" placeholder="VD: 4960000">
          </div>
          <div class="form-group">
            <label>Trần BHTN (VND)</label>
            <input v-model.number="editingZone.bhtnCeiling" type="number" class="form-input" placeholder="VD: 99200000">
          </div>
          <div class="modal-buttons">
            <button class="btn-save" @click="saveZone">Lưu</button>
            <button class="btn-cancel" @click="showAddZone = false">Hủy</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { taxCalculatorAPI, type TaxBracketOption, type DeductionBracketOption, type WageZoneOption } from '@/api/tax-calculator'

const activeTab = ref('brackets')

// Configuration data
const taxBrackets = ref<TaxBracketOption[]>([])
const deductionBrackets = ref<DeductionBracketOption[]>([])
const wageZones = ref<WageZoneOption[]>([])

// Expanded bracket state
const expandedBracketValue = ref<string | null>(null)
const expandedBracket = computed(() => {
  if (!expandedBracketValue.value) return null
  return taxBrackets.value.find(b => b.value === expandedBracketValue.value)
})

// Modal states
const showAddBracket = ref(false)
const showAddDeduction = ref(false)
const showAddZone = ref(false)
const showEditBracketDetails = ref(false)

// Editing states
const editingBracket = ref<any>({
  value: '',
  label: '',
  effectiveDate: '',
  brackets: []
})

const editingDeduction = ref<any>({
  value: '',
  label: '',
  personalDeduction: 0,
  dependentDeduction: 0,
  effectiveDate: ''
})

const editingZone = ref<any>({
  value: '',
  label: '',
  minimumWage: 0,
  bhtnCeiling: 0
})

// Methods
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value)
}

function expandBracket(bracket: TaxBracketOption) {
  if (expandedBracketValue.value === bracket.value) {
    expandedBracketValue.value = null
  } else {
    expandedBracketValue.value = bracket.value
  }
}

function editBracket(bracket: TaxBracketOption) {
  editingBracket.value = { ...bracket, brackets: bracket.brackets ? [...bracket.brackets] : [] }
  showAddBracket.value = true
}

function editBracketDetails(bracket: TaxBracketOption) {
  editingBracket.value = { ...bracket, brackets: bracket.brackets ? [...bracket.brackets] : [] }
  showEditBracketDetails.value = true
}

function addBracketDetail() {
  if (!editingBracket.value.brackets) {
    editingBracket.value.brackets = []
  }
  const lastOrder = editingBracket.value.brackets.length > 0 
    ? Math.max(...editingBracket.value.brackets.map((b: any) => b.order)) 
    : 0
  editingBracket.value.brackets.push({
    minIncome: 0,
    maxIncome: null,
    rate: 0,
    deduction: 0,
    order: lastOrder + 1
  })
}

function removeBracketDetail(index: string | number) {
  const idx = typeof index === 'string' ? parseInt(index) : index
  if (editingBracket.value.brackets) {
    editingBracket.value.brackets.splice(idx, 1)
  }
}

function saveBracketDetails() {
  // TODO: Call backend API to save bracket details
  ElMessage.success('Cập nhật chi tiết bảng lũy tuyến thành công!')
  showEditBracketDetails.value = false
  loadTaxConfig()
}

function saveBracket() {
  // TODO: Call backend API to save
  ElMessage.success('Cập nhật biểu thuế thành công!')
  showAddBracket.value = false
  loadTaxConfig()
}

function deleteBracket(value: string) {
  if (confirm('Bạn có chắc muốn xóa biểu thuế này?')) {
    // TODO: Call backend API to delete
    ElMessage.success('Xóa biểu thuế thành công!')
    loadTaxConfig()
  }
}

function editDeduction(deduction: DeductionBracketOption) {
  editingDeduction.value = { ...deduction }
  showAddDeduction.value = true
}

function saveDeduction() {
  // TODO: Call backend API to save
  ElMessage.success('Cập nhật biểu khấu trừ thành công!')
  showAddDeduction.value = false
  loadTaxConfig()
}

function deleteDeduction(value: string) {
  if (confirm('Bạn có chắc muốn xóa biểu khấu trừ này?')) {
    // TODO: Call backend API to delete
    ElMessage.success('Xóa biểu khấu trừ thành công!')
    loadTaxConfig()
  }
}

function editZone(zone: WageZoneOption) {
  editingZone.value = { ...zone }
  showAddZone.value = true
}

function saveZone() {
  // TODO: Call backend API to save
  ElMessage.success('Cập nhật vùng lương thành công!')
  showAddZone.value = false
  loadTaxConfig()
}

function deleteZone(value: string) {
  if (confirm('Bạn có chắc muốn xóa vùng lương này?')) {
    // TODO: Call backend API to delete
    ElMessage.success('Xóa vùng lương thành công!')
    loadTaxConfig()
  }
}

function resetToDefaults() {
  if (confirm('Bạn có chắc muốn đặt lại tất cả cấu hình về mặc định? Hành động này không thể hoàn tác!')) {
    // TODO: Call backend API to reset
    ElMessage.success('Cấu hình đã được đặt lại về mặc định!')
    loadTaxConfig()
    expandedBracketValue.value = null
  }
}

async function loadTaxConfig() {
  try {
    const config = await taxCalculatorAPI.getTaxConfig()
    taxBrackets.value = config.taxBrackets
    deductionBrackets.value = config.deductionBrackets
    wageZones.value = config.wageZones
  } catch (error) {
    console.error('Failed to load tax configuration:', error)
    ElMessage.error('Không thể tải cấu hình thuế')
  }
}

onMounted(() => {
  loadTaxConfig()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.tax-settings-container {
  background: #f8f9fa;
  border-radius: 0;
  box-shadow: none;
  max-width: 100%;
  margin: 0;
  padding: 30px;
}

.settings-header {
  text-align: center;
  margin-bottom: 35px;
  border-bottom: 2px solid #2c3e50;
  padding-bottom: 20px;
  position: relative;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-header h1 {
  color: #2c3e50;
  font-size: 26px;
  margin-bottom: 8px;
  font-weight: 700;
}

.settings-header p {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 15px;
}

.btn-reset {
  position: absolute;
  top: 30px;
  right: 30px;
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: #c0392b;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.tabs-wrapper {
  display: flex;
  gap: 0;
  margin-bottom: 0;
  border-bottom: 2px solid #ecf0f1;
  background: white;
  padding: 0 30px;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-button {
  padding: 16px 24px;
  background: none;
  border: none;
  color: #7f8c8d;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s ease;
  font-size: 13px;
}

.tab-button.active {
  color: #2c3e50;
  border-bottom-color: #3498db;
}

.tab-button:hover {
  color: #3498db;
}

.tab-content {
  animation: fadeIn 0.3s ease;
  background: white;
  padding: 30px;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.section-title {
  color: #2c3e50;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #ecf0f1;
}

.settings-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.settings-table thead {
  background: #ecf0f1;
}

.settings-table th {
  padding: 14px 12px;
  text-align: left;
  font-weight: 700;
  color: #2c3e50;
  border-bottom: 2px solid #bdc3c7;
  font-size: 13px;
}

.settings-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #ecf0f1;
  color: #555;
  font-size: 13px;
}

.settings-table tr:hover {
  background: #f9f9f9;
}

.bracket-row {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.bracket-row:hover {
  background: #f8f9fa;
}

.bracket-row.expanded {
  background: #f0f7ff;
  font-weight: 600;
  color: #2c3e50;
}

.bracket-details-row td {
  padding: 0 !important;
}

.bracket-details {
  padding: 20px;
  background: #f8f9fa;
  border-top: 2px solid #3498db;
  margin: 0;
}

.bracket-details h4 {
  color: #2c3e50;
  font-size: 14px;
  margin-bottom: 15px;
  font-weight: 700;
}

.details-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  background: white;
  border: 1px solid #bdc3c7;
}

.details-table thead {
  background: #ecf0f1;
}

.details-table th {
  padding: 10px;
  text-align: left;
  font-weight: 700;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  font-size: 12px;
}

.details-table td {
  padding: 10px;
  border-bottom: 1px solid #ecf0f1;
  color: #555;
  font-size: 12px;
}

.details-table tr:hover {
  background: #f8f9fa;
}

.btn-edit-brackets {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit-brackets:hover {
  background: #2980b9;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-edit, .btn-delete, .btn-add, .btn-save, .btn-cancel {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 4px;
}

.btn-edit {
  background: #3498db;
  color: white;
}

.btn-edit:hover {
  background: #2980b9;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

.btn-add {
  background: #27ae60;
  color: white;
  padding: 10px 16px;
  font-size: 13px;
}

.btn-add:hover {
  background: #229954;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
}

.btn-save {
  background: #27ae60;
  color: white;
}

.btn-save:hover {
  background: #229954;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
  box-shadow: 0 2px 8px rgba(127, 140, 141, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content.large-modal {
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 700;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 700;
  font-size: 13px;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.bracket-details-editor {
  margin: 20px 0;
}

.edit-details-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  background: white;
  border: 1px solid #bdc3c7;
}

.edit-details-table thead {
  background: #ecf0f1;
}

.edit-details-table th {
  padding: 10px;
  text-align: left;
  font-weight: 700;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  font-size: 12px;
}

.edit-details-table td {
  padding: 8px;
  border-bottom: 1px solid #ecf0f1;
}

.form-input-small {
  width: 100%;
  padding: 6px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 12px;
  box-sizing: border-box;
}

.form-input-small:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.btn-delete-small {
  padding: 4px 8px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-delete-small:hover {
  background: #c0392b;
  box-shadow: 0 2px 6px rgba(231, 76, 60, 0.3);
}

.btn-add-small {
  padding: 8px 16px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-small:hover {
  background: #229954;
  box-shadow: 0 2px 6px rgba(39, 174, 96, 0.3);
}

@media (max-width: 768px) {
  .tax-settings-container {
    padding: 24px;
  }

  .settings-header h1 {
    font-size: 22px;
  }

  .settings-table {
    font-size: 12px;
  }

  .settings-table th, .settings-table td {
    padding: 8px;
  }
}
</style>
