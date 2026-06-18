<template>
  <div class="question-list">
    <div
      v-for="q in questions"
      :key="q.id"
      class="question-item"
    >
      <div class="question-header" @click="toggleExpand(q.id)">
        <span class="question-text" v-html="highlightText(q.question, keyword)"></span>
        <span :class="['arrow', { expanded: expandedId === q.id }]">▼</span>
      </div>
      <div v-if="expandedId === q.id" class="answer">
        <strong>答案：</strong>{{ q.answer }}
      </div>
    </div>
    <div v-if="questions.length === 0" class="empty">
      暂无题目
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { highlightText } from '../utils/highlight'

defineProps<{
  questions: any[]
  keyword: string
}>()

const expandedId = ref<number | null>(null)

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<style scoped>
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
  padding: 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.question-header:hover {
  background: #f8f9fa;
}

.question-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.5;
}

.arrow {
  margin-left: 12px;
  font-size: 12px;
  color: #999;
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

.question-text :deep(.highlight) {
  color: #e74c3c;
  font-weight: bold;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}
</style>
