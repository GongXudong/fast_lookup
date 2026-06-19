<template>
  <div class="form-container">
    <div class="page-header">
      <h2 class="title">题目管理</h2>
      <div class="header-actions">
        <button
          class="btn-import"
          title="xls文件应包含两列：题目，答案！"
          @click="importXls"
        >
          从xls文件导入
        </button>
        <button class="btn-export" @click="exportXls">
          导出题目至xls文件
        </button>
        <button class="btn-delete-all" @click="deleteAll">
          删除所有题目
        </button>
      </div>
    </div>

    <div class="form-card">
      <h3>{{ isEditing ? '编辑题目' : '新增题目' }}</h3>
      <div class="form-group">
        <label>题干</label>
        <textarea v-model="form.question" placeholder="请输入题干..." rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>答案</label>
        <textarea v-model="form.answer" placeholder="请输入答案..." rows="3"></textarea>
      </div>
      <div class="form-actions">
        <button v-if="isEditing" class="btn-cancel" @click="cancelEdit">取消</button>
        <button class="btn-primary" @click="saveQuestion">
          {{ isEditing ? '保存' : '添加' }}
        </button>
      </div>
    </div>

    <div class="question-list">
      <div v-for="q in questions" :key="q.id" class="question-item">
        <div class="question-header">
          <span class="question-text" @click="toggleExpand(q.id)">{{ q.question }}</span>
          <span
            class="arrow"
            :class="{ expanded: expandedId === q.id }"
            @click="toggleExpand(q.id)"
          >▼</span>
          <div class="question-actions">
            <button class="btn-edit" @click="editQuestion(q)">编辑</button>
            <button class="btn-delete" @click="deleteQuestion(q.id)">删除</button>
          </div>
        </div>
        <div v-if="expandedId === q.id" class="answer">
          <strong>答案：</strong>{{ q.answer }}
        </div>
      </div>
      <div v-if="questions.length === 0" class="empty">
        暂无题目，点击上方添加
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const questions = ref<any[]>([])
const form = ref({ id: null as number | null, question: '', answer: '' })
const expandedId = ref<number | null>(null)

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}
const isEditing = ref(false)

async function loadQuestions() {
  if (window.electronAPI) {
    questions.value = await window.electronAPI.getAll()
  }
}

async function saveQuestion() {
  if (!form.value.question.trim() || !form.value.answer.trim()) return

  if (window.electronAPI) {
    if (isEditing.value && form.value.id) {
      await window.electronAPI.update(form.value.id, form.value.question, form.value.answer)
    } else {
      await window.electronAPI.create(form.value.question, form.value.answer)
    }
    resetForm()
    await loadQuestions()
  }
}

function editQuestion(q: any) {
  form.value = { id: q.id, question: q.question, answer: q.answer }
  isEditing.value = true
}

function cancelEdit() {
  resetForm()
}

async function importXls() {
  if (!window.electronAPI) return
  const result = await window.electronAPI.importXls()
  if (result.success) {
    await loadQuestions()
  }
}

async function exportXls() {
  if (!window.electronAPI) return
  await window.electronAPI.exportXls()
}

async function deleteAll() {
  if (!window.electronAPI) return
  const result = await window.electronAPI.deleteAll()
  if (result.success) {
    await loadQuestions()
  }
}

async function deleteQuestion(id: number) {
  if (window.electronAPI) {
    await window.electronAPI.delete(id)
    await loadQuestions()
  }
}

function resetForm() {
  form.value = { id: null, question: '', answer: '' }
  isEditing.value = false
}

onMounted(() => {
  loadQuestions()
})
</script>

<style scoped>
.form-container {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.title {
  font-size: 20px;
  color: #2c3e50;
}

.btn-import,
.btn-export,
.btn-delete-all {
  padding: 9px 18px;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-import {
  background: #27ae60;
}

.btn-import:hover {
  background: #219150;
}

.btn-export {
  background: #3498db;
}

.btn-export:hover {
  background: #2980b9;
}

.btn-delete-all {
  background: #e74c3c;
}

.btn-delete-all:hover {
  background: #c0392b;
}

.form-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-card h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #666;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary {
  padding: 10px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-cancel {
  padding: 10px 24px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.question-header {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.question-text {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #2c3e50;
  cursor: pointer;
  line-height: 1.5;
}

.arrow {
  font-size: 12px;
  color: #999;
  cursor: pointer;
  transition: transform 0.2s;
}

.arrow.expanded {
  transform: rotate(180deg);
}

.answer {
  padding: 16px;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.question-actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-edit {
  background: #3498db;
  color: white;
}

.btn-edit:hover {
  background: #2980b9;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}
</style>
