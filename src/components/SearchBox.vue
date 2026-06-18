<template>
  <div class="search-container">
    <div class="search-box">
      <input
        v-model="keyword"
        type="text"
        placeholder="输入关键字搜索题目..."
        @input="onSearch"
      />
    </div>
    <QuestionList
      v-if="keyword.trim()"
      :questions="questions"
      :keyword="keyword"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QuestionList from './QuestionList.vue'

const keyword = ref('')
const questions = ref<any[]>([])

async function onSearch() {
  if (!keyword.value.trim()) {
    questions.value = []
    return
  }
  if (window.electronAPI) {
    questions.value = await window.electronAPI.search(keyword.value)
  }
}
</script>

<style scoped>
.search-container {
  padding: 24px;
}

.search-box {
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  padding: 14px 18px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #3498db;
}
</style>
