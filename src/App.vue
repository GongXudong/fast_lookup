<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="logo">题目速查系统</div>
      <nav class="nav">
        <button
          :class="['nav-item', { active: currentView === 'search' }]"
          @click="currentView = 'search'"
        >
          题目速查
        </button>
        <button
          :class="['nav-item', { active: currentView === 'manage' }]"
          @click="currentView = 'manage'"
        >
          题目管理
        </button>
      </nav>
      <div class="support">技术支持：gongxudong_cs@aliyun.com</div>
    </aside>

    <main class="main-content">
      <SearchBox v-if="currentView === 'search'" />
      <QuestionForm v-else-if="currentView === 'manage'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchBox from './components/SearchBox.vue'
import QuestionForm from './components/QuestionForm.vue'

const currentView = ref<'search' | 'manage'>('search')
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 220px;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 24px 20px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #3d5166;
}

.nav {
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.support {
  margin-top: auto;
  padding: 16px 20px;
  font-size: 12px;
  line-height: 1.5;
  color: #8a99a8;
  border-top: 1px solid #3d5166;
  word-break: break-all;
}

.nav-item {
  padding: 12px 16px;
  margin-bottom: 4px;
  border: none;
  background: transparent;
  color: #bdc3c7;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #3d5166;
  color: white;
}

.nav-item.active {
  background: #3498db;
  color: white;
}

.main-content {
  flex: 1;
  background: #f5f5f5;
  overflow-y: auto;
}
</style>
