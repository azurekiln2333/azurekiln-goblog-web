<template>
  <article class="flex flex-col md:flex-row gap-8 group cursor-pointer" @click="$router.push(`/article/${article.id}`)">
    <div class="md:w-1/3 h-48 rounded-xl overflow-hidden bg-slate-200">
      <img
        v-if="article.cover"
        :src="article.cover"
        :alt="article.title"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        <span class="material-symbols-outlined text-blue-400 text-4xl">article</span>
      </div>
    </div>
    <div class="md:w-2/3 flex flex-col justify-center">
      <div class="flex items-center gap-4 mb-3">
        <span v-if="article.categoryTitle" class="text-[10px] font-bold tracking-widest uppercase text-blue-600">{{ article.categoryTitle }}</span>
        <span class="text-[10px] text-slate-400 uppercase font-medium">{{ formatDate(article.createdAt) }}</span>
      </div>
      <h2 class="text-2xl font-bold mb-3 font-headline text-slate-900 group-hover:text-blue-600 transition-colors">{{ article.title }}</h2>
      <p class="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-2">{{ article.abstract }}</p>
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <span v-if="!article.authorAvatar" class="text-[10px] font-bold text-blue-600">{{ (article.authorNickName || '?')[0] }}</span>
          <img v-else :src="article.authorAvatar" :alt="article.authorNickName" class="w-full h-full rounded-full object-cover" />
        </div>
        <span class="text-xs font-semibold text-slate-600">{{ article.authorNickName || '匿名' }}</span>
        <span class="text-xs text-slate-400 ml-auto">{{ article.viewCount || 0 }} 浏览</span>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({ article: { type: Object, required: true } })

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}
</script>
