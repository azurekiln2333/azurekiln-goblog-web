<template>
  <div class="bg-white p-6 rounded-xl border border-blue-200">
    <div class="flex items-center gap-2 mb-4">
      <span class="material-symbols-outlined text-blue-600" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
      <h3 class="text-xs font-bold uppercase tracking-widest text-blue-800">GoBlog AI</h3>
    </div>
    <div class="bg-blue-50 p-3 rounded-md mb-4 shadow-sm">
      <p class="text-xs text-slate-700 leading-relaxed">{{ lastReply || '您好！有什么可以帮您？' }}</p>
    </div>
    <div class="relative">
      <input
        v-model="inputText"
        class="w-full bg-white border border-blue-200 px-3 py-2 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
        placeholder="提问..."
        type="text"
        @keyup.enter="sendToAI"
      />
      <button class="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600" @click="sendToAI">
        <span class="material-symbols-outlined text-sm">send</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { chatWithAI } from '@/api/ai'

const inputText = ref('')
const lastReply = ref('')
const messages = ref([])

async function sendToAI() {
  const text = inputText.value.trim()
  if (!text) return
  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  try {
    const res = await chatWithAI({ messages: messages.value, user_input: text })
    const reply = res.data?.content || res.content || '抱歉，AI 暂时无法回复。'
    messages.value.push({ role: 'assistant', content: reply })
    lastReply.value = reply
  } catch {
    lastReply.value = '请求失败，请稍后再试。'
  }
}
</script>
