<template>
  <section class="mb-16" v-if="banner">
    <div class="relative w-full h-[500px] overflow-hidden rounded-xl bg-slate-100 group">
      <img
        v-if="banner.cover"
        :src="banner.cover"
        :alt="banner.title || '特色文章'"
        class="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-blue-800 to-blue-600"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent"></div>
      <div class="absolute bottom-0 left-0 p-12 max-w-2xl text-white">
        <span class="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest uppercase bg-blue-600 text-white rounded-full">特色文章</span>
        <h1 class="text-4xl md:text-5xl font-extrabold leading-tight mb-4 font-headline">{{ banner.title || '欢迎来到精析编辑' }}</h1>
        <p class="text-lg text-blue-50 mb-6 font-body opacity-90">{{ banner.abstract || '探索技术与设计的交汇点' }}</p>
        <router-link
          v-if="banner.href"
          :to="banner.href"
          class="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold text-sm hover:bg-blue-700 hover:translate-y-[-2px] transition-all duration-300 shadow-xl shadow-blue-900/20"
        >
          阅读全文
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({ banner: { type: Object, default: null } })
</script>
