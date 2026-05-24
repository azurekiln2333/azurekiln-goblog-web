<template>
  <main class="pt-24 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-12 gap-8">
    <aside class="col-span-12 lg:col-span-3 space-y-6">
      <div class="bg-white p-6 rounded-xl shadow-sm space-y-4 border border-slate-100">
        <div class="flex flex-col items-center text-center">
          <div class="relative group">
            <div class="h-24 w-24 rounded-full border-4 border-slate-50 overflow-hidden mb-4 shadow-sm">
              <img v-if="userStore.userInfo?.avatar" :src="userStore.userInfo.avatar" alt="头像" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full bg-blue-100 flex items-center justify-center">
                <span class="text-2xl font-bold text-blue-600">{{ (userStore.userInfo?.nickName || '?')[0] }}</span>
              </div>
            </div>
            <button
              class="absolute bottom-2 right-0 bg-slate-300 text-white p-1.5 rounded-full cursor-not-allowed"
              disabled
              title="头像编辑接口暂未开放"
            >
              <span class="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <h2 class="text-xl font-bold tracking-tight">{{ userStore.userInfo?.nickName || '用户' }}</h2>
          <p class="text-on-surface-variant text-sm font-medium">{{ userStore.userInfo?.abstract || '暂无简介' }}</p>
        </div>
        <div class="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div class="flex flex-col">
            <span class="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">主要邮箱</span>
            <span class="text-sm font-medium">{{ userStore.userInfo?.email || '未设置' }}</span>
          </div>
          <button
            class="w-full text-left py-2.5 px-4 text-sm font-semibold text-primary bg-blue-light rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
            @click="$router.push('/user/messages')"
          >
            <span class="material-symbols-outlined text-lg">mail</span>
            消息中心
          </button>
          <button
            class="w-full text-left py-2.5 px-4 text-sm font-semibold text-primary bg-blue-light rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
            @click="$router.push('/user/editor')"
          >
            <span class="material-symbols-outlined text-lg">edit_note</span>
            写文章
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div class="p-4 bg-slate-50 flex justify-between items-center border-b border-slate-100">
          <h3 class="font-bold text-sm">直接消息</h3>
          <span v-if="totalUnread > 0" class="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{{ totalUnread }} 条新消息</span>
        </div>
        <div v-if="sessionsLoading" class="p-6 text-center text-slate-400">
          <span class="material-symbols-outlined animate-spin">progress_activity</span>
          <p class="mt-2 text-[10px] font-bold uppercase tracking-widest">加载会话中</p>
        </div>
        <div v-else-if="sessions.length === 0" class="p-6 text-center text-xs text-slate-400">
          暂无直接消息
        </div>
        <div v-else class="divide-y divide-slate-50">
          <button
            v-for="session in sessions"
            :key="session.userID"
            class="w-full p-4 flex gap-3 items-center hover:bg-slate-50 transition-colors text-left"
            @click="openChat(session)"
          >
            <div class="h-10 w-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
              <img v-if="session.avatar" :src="session.avatar" :alt="session.nickName" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline">
                <p class="text-sm font-bold truncate">{{ session.nickName }}</p>
                <span class="text-[10px] text-on-surface-variant">{{ timeAgo(session.lastMsgTime) }}</span>
              </div>
              <p class="text-xs text-on-surface-variant truncate">{{ session.lastMsg }}</p>
            </div>
          </button>
        </div>
      </div>
    </aside>

    <div class="col-span-12 lg:col-span-6 space-y-6">
      <div class="bg-white rounded-xl shadow-sm min-h-[600px] flex flex-col border border-slate-100">
        <div class="flex px-6 pt-4 border-b border-slate-100">
          <button
            class="px-6 py-3 text-sm font-bold border-b-2 transition-colors"
            :class="activeTab === 'collections' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
            @click="activeTab = 'collections'"
          >
            我的收藏夹
          </button>
          <button
            class="px-6 py-3 text-sm font-bold border-b-2 transition-colors"
            :class="activeTab === 'articles' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
            @click="activeTab = 'articles'"
          >
            我的文章
          </button>
          <button
            class="px-6 py-3 text-sm font-bold border-b-2 transition-colors"
            :class="activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
            @click="activeTab = 'history'"
          >
            浏览记录
          </button>
          <button
            class="px-6 py-3 text-sm font-bold border-b-2 transition-colors"
            :class="activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
            @click="activeTab = 'settings'"
          >
            资料设置
          </button>
        </div>

        <div v-if="errorMsg" class="mx-6 mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {{ errorMsg }}
        </div>

        <div class="p-6 flex-1">
          <div v-if="activeTab === 'collections'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="collectionsLoading" class="col-span-full py-16 text-center text-slate-400">
              <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
              <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载收藏夹中</p>
            </div>
            <div
              v-for="folder in collectFolders"
              :key="folder.id"
              class="p-5 bg-slate-50 rounded-xl hover:bg-blue-light transition-colors cursor-pointer group border border-transparent hover:border-blue-100"
              @click="openFolder(folder)"
            >
              <div class="flex items-center justify-between mb-4">
                <span class="material-symbols-outlined text-primary p-2 bg-white rounded-lg shadow-sm">folder</span>
                <span class="text-[10px] font-bold text-on-surface-variant group-hover:text-primary transition-colors">{{ folder.articleCount || 0 }} 篇文章</span>
              </div>
              <h4 class="font-bold text-base mb-1">{{ folder.title }}</h4>
              <p class="text-xs text-on-surface-variant leading-relaxed">{{ folder.abstract || '暂无简介' }}</p>
              <div class="mt-4 flex flex-wrap gap-3">
                <button class="text-[10px] font-bold text-primary hover:underline" @click.stop="startEditFolder(folder)">编辑</button>
                <button
                  class="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:underline disabled:opacity-50"
                  :disabled="folderActionKey === `delete-${folder.id}` || folder.isDefault"
                  :title="folder.isDefault ? '默认收藏夹不能删除' : '删除收藏夹'"
                  @click.stop="deleteFolder(folder)"
                >
                  <span v-if="folderActionKey === `delete-${folder.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  删除
                </button>
              </div>
            </div>
            <button
              type="button"
              class="p-5 bg-slate-50 rounded-xl hover:bg-blue-light transition-colors cursor-pointer group border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center"
              @click="showCreateFolder = true"
            >
              <span class="material-symbols-outlined text-slate-400 mb-2">create_new_folder</span>
              <p class="text-xs font-bold text-slate-500">创建新收藏夹</p>
            </button>

            <div v-if="selectedFolder" class="col-span-full rounded-xl bg-white p-5 ring-1 ring-blue-100">
              <div class="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 class="font-bold text-on-surface">{{ selectedFolder.title }}</h3>
                  <p class="mt-1 text-xs text-on-surface-variant">{{ selectedFolder.abstract || '暂无简介' }}</p>
                </div>
                <button class="material-symbols-outlined text-slate-400 hover:text-slate-700" @click="closeFolderDetail">close</button>
              </div>

              <div v-if="folderArticlesLoading" class="py-12 text-center text-slate-400">
                <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载收藏文章中</p>
              </div>
              <div v-else-if="folderArticles.length === 0" class="py-10 text-center text-sm text-slate-400">
                这个收藏夹暂无文章
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="article in folderArticles"
                  :key="article.id"
                  class="flex cursor-pointer items-center gap-4 rounded-xl bg-slate-50 p-4 hover:bg-blue-light"
                  @click="$router.push(`/article/${article.id}`)"
                >
                  <img v-if="article.cover" :src="article.cover" :alt="article.title" class="h-14 w-20 rounded-lg object-cover" />
                  <div class="min-w-0 flex-1">
                    <h4 class="truncate text-sm font-bold">{{ article.title }}</h4>
                    <p class="mt-1 text-xs text-on-surface-variant">{{ article.abstract || formatDate(article.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'articles'" class="space-y-4">
            <div v-if="articlesLoading" class="py-16 text-center text-slate-400">
              <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
              <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载文章中</p>
            </div>
            <div v-for="art in myArticles" :key="art.id" class="p-4 bg-slate-50 rounded-xl flex flex-col gap-4 hover:bg-blue-light transition-colors md:flex-row md:items-center">
              <div class="min-w-0 flex-1 cursor-pointer" @click="$router.push(`/article/${art.id}`)">
                <div class="mb-1 flex flex-wrap items-center gap-2">
                  <h4 class="font-bold text-sm">{{ art.title }}</h4>
                  <span v-if="art.userTop" class="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-primary">已置顶</span>
                </div>
                <p class="text-xs text-on-surface-variant">{{ formatDate(art.createdAt) }} · {{ art.lookCount || art.viewCount || 0 }} 浏览</p>
              </div>
              <span
                class="self-start text-[10px] font-bold px-2 py-1 rounded-full md:self-auto"
                :class="statusClass(art.status)"
              >{{ statusText(art.status) }}</span>
              <div class="flex flex-wrap gap-2">
                <button
                  class="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  @click="$router.push(`/article/${art.id}`)"
                >
                  <span class="material-symbols-outlined text-sm">visibility</span>
                  查看
                </button>
                <button
                  class="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  @click="editArticle(art)"
                >
                  <span class="material-symbols-outlined text-sm">edit</span>
                  编辑
                </button>
                <button
                  class="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="articleActionKey === `top-${art.id}`"
                  @click="toggleMyArticleTop(art)"
                >
                  <span v-if="articleActionKey === `top-${art.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  <span v-else class="material-symbols-outlined text-sm">{{ art.userTop ? 'vertical_align_bottom' : 'vertical_align_top' }}</span>
                  {{ art.userTop ? '取消置顶' : '置顶' }}
                </button>
                <button
                  v-if="!isConfirmingDelete(art.id)"
                  class="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-red-600 ring-1 ring-red-100 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="articleActionKey === `delete-${art.id}`"
                  @click="requestDeleteArticle(art)"
                >
                  <span class="material-symbols-outlined text-sm">delete</span>
                  删除
                </button>
                <template v-else>
                  <button
                    class="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="articleActionKey === `delete-${art.id}`"
                    @click="deleteMyArticle(art)"
                  >
                    <span v-if="articleActionKey === `delete-${art.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    确认删除
                  </button>
                  <button
                    class="rounded-lg px-3 py-2 text-[10px] font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                    :disabled="articleActionKey === `delete-${art.id}`"
                    @click="articleActionKey = ''"
                  >
                    取消
                  </button>
                </template>
              </div>
            </div>
            <div v-if="!articlesLoading && myArticles.length === 0" class="py-16 text-center text-sm text-slate-400">
              暂无文章
            </div>
          </div>

          <div v-if="activeTab === 'history'" class="space-y-4">
            <div v-if="historyList.length > 0" class="flex justify-end">
              <button
                class="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline disabled:opacity-50"
                :disabled="historyActionKey === 'clear'"
                @click="clearCurrentHistory"
              >
                <span v-if="historyActionKey === 'clear'" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                清理当前页记录
              </button>
            </div>
            <div v-if="historyLoading" class="py-16 text-center text-slate-400">
              <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
              <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载浏览记录中</p>
            </div>
            <div v-for="h in historyList" :key="h.id" class="p-4 bg-slate-50 rounded-xl flex items-center gap-4 hover:bg-blue-light transition-colors cursor-pointer" @click="$router.push(`/article/${h.articleID}`)">
              <div class="flex-1">
                <h4 class="font-bold text-sm mb-1">{{ h.title || h.articleTitle || `文章 #${h.articleID}` }}</h4>
                <p class="text-xs text-on-surface-variant">{{ formatDate(h.lookDate || h.createdAt) }}</p>
              </div>
              <button
                class="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:underline disabled:opacity-50"
                :disabled="historyActionKey === `delete-${h.id}`"
                @click.stop="deleteHistoryItem(h.id)"
              >
                <span v-if="historyActionKey === `delete-${h.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                删除
              </button>
            </div>
            <div v-if="!historyLoading && historyList.length === 0" class="py-16 text-center text-sm text-slate-400">
              暂无浏览记录
            </div>
          </div>

          <div v-if="activeTab === 'settings'" class="space-y-8">
            <form class="space-y-5" @submit.prevent="saveProfile">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">昵称</label>
                  <input v-model="profileForm.nickName" class="mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" maxlength="32" />
                </div>
                <div>
                  <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">年龄</label>
                  <input v-model.number="profileForm.Age" type="number" min="0" class="mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div class="md:col-span-2">
                  <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">头像 URL</label>
                  <input v-model="profileForm.avatar" class="mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://..." />
                </div>
                <div class="md:col-span-2">
                  <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">简介</label>
                  <textarea v-model="profileForm.abstract" class="mt-1 w-full resize-none rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" rows="3"></textarea>
                </div>
                <div>
                  <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">兴趣标签</label>
                  <input v-model="profileForm.likeTagsText" class="mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Vue, Go, 摄影" />
                </div>
                <div>
                  <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">联系方式</label>
                  <textarea v-model="profileForm.contactInfoText" class="mt-1 w-full resize-none rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" rows="2" placeholder="github=https://github.com/name"></textarea>
                </div>
              </div>

              <div class="rounded-xl bg-slate-50 p-4">
                <h3 class="text-sm font-bold text-slate-900">公开设置</h3>
                <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <label class="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" v-model="profileForm.openCollect" />
                    公开收藏夹
                  </label>
                  <label class="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" v-model="profileForm.openFollow" />
                    公开关注
                  </label>
                  <label class="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" v-model="profileForm.openFans" />
                    公开粉丝
                  </label>
                </div>
              </div>

              <div v-if="profileError" class="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {{ profileError }}
              </div>
              <div v-if="profileSuccess" class="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                {{ profileSuccess }}
              </div>

              <div class="flex justify-end">
                <button class="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" :disabled="profileSaving">
                  <span v-if="profileSaving" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  {{ profileSaving ? '保存中...' : '保存资料' }}
                </button>
              </div>
            </form>

            <div class="border-t border-slate-100 pt-6">
              <h3 class="text-sm font-bold text-slate-900">重置邮箱</h3>
              <p class="mt-1 text-xs text-slate-500">验证码会同时发送到当前邮箱和新邮箱，需在 2 分钟内完成验证。</p>

              <div class="mt-4 space-y-4">
                <div>
                  <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">新邮箱</label>
                  <input v-model="resetEmailForm.email" type="email" class="mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="new@example.com" />
                </div>
                <div>
                  <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">图形验证码</label>
                  <div class="mt-1 flex gap-3">
                    <input v-model="resetEmailForm.captchaCode" class="min-w-0 flex-1 rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="输入验证码" />
                    <button
                      v-if="resetEmailCaptcha?.captcha"
                      type="button"
                      class="h-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-200"
                      title="点击刷新验证码"
                      @click="fetchResetEmailCaptcha"
                    >
                      <img :src="resetEmailCaptcha.captcha" alt="邮箱重置验证码" class="h-full" />
                    </button>
                    <button
                      v-else
                      type="button"
                      class="inline-flex h-12 items-center gap-1 rounded-lg bg-blue-50 px-4 text-xs font-bold text-primary disabled:opacity-50"
                      :disabled="resetEmailCaptchaLoading"
                      @click="fetchResetEmailCaptcha"
                    >
                      <span v-if="resetEmailCaptchaLoading" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      获取验证码
                    </button>
                  </div>
                </div>
                <div class="flex flex-wrap gap-3">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="resetEmailSending || resetEmailCountdown > 0"
                    @click="sendResetEmailCodes"
                  >
                    <span v-if="resetEmailSending" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    {{ resetEmailCountdown > 0 ? `${resetEmailCountdown}s 后重发` : (resetEmailSending ? '发送中...' : '发送邮箱验证码') }}
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="resetEmailCaptchaLoading"
                    @click="fetchResetEmailCaptcha"
                  >
                    <span v-if="resetEmailCaptchaLoading" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    刷新图形验证码
                  </button>
                </div>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">当前邮箱验证码</label>
                    <input v-model="resetEmailForm.resetEmailCode" class="mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="原邮箱收到的验证码" />
                  </div>
                  <div>
                    <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">新邮箱验证码</label>
                    <input v-model="resetEmailForm.emailCode" class="mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="新邮箱收到的验证码" />
                  </div>
                </div>

                <div v-if="resetEmailError" class="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {{ resetEmailError }}
                </div>
                <div v-if="resetEmailSuccess" class="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  {{ resetEmailSuccess }}
                </div>

                <div class="flex justify-end">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="resetEmailSaving"
                    @click="submitResetEmail"
                  >
                    <span v-if="resetEmailSaving" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    {{ resetEmailSaving ? '提交中...' : '确认重置邮箱' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-6">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-900">登录日志</h3>
                <button class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline disabled:opacity-50" :disabled="loginLogsLoading" @click="fetchLoginLogs">
                  <span v-if="loginLogsLoading" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  刷新
                </button>
              </div>
              <div v-if="loginLogsError" class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {{ loginLogsError }}
              </div>
              <div v-if="loginLogsLoading" class="py-10 text-center text-slate-400">
                <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载登录日志中</p>
              </div>
              <div v-else class="overflow-hidden rounded-xl ring-1 ring-slate-100">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <tr>
                      <th class="px-4 py-3 text-left">时间</th>
                      <th class="px-4 py-3 text-left">IP</th>
                      <th class="px-4 py-3 text-left">地址</th>
                      <th class="px-4 py-3 text-left">设备</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    <tr v-for="log in loginLogs" :key="log.id">
                      <td class="px-4 py-3 text-slate-600">{{ formatDateTime(log.createdAt) }}</td>
                      <td class="px-4 py-3 text-slate-600">{{ log.ip || '-' }}</td>
                      <td class="px-4 py-3 text-slate-600">{{ log.addr || '-' }}</td>
                      <td class="px-4 py-3 text-slate-500">{{ log.userAgent || '-' }}</td>
                    </tr>
                    <tr v-if="loginLogs.length === 0">
                      <td colspan="4" class="px-4 py-10 text-center text-sm text-slate-400">暂无登录日志</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <aside class="col-span-12 lg:col-span-3">
      <AIChatWidget />
    </aside>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCreateFolder" class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-sm">
          <form class="w-full max-w-md rounded-lg bg-surface-container-lowest p-6 shadow-[0_10px_30px_rgba(25,28,30,0.10)]" @submit.prevent="createFolder">
            <div class="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 class="text-lg font-extrabold text-on-surface">创建收藏夹</h3>
                <p class="mt-1 text-xs text-on-surface-variant">用于整理收藏文章，可稍后继续编辑。</p>
              </div>
              <button type="button" class="material-symbols-outlined text-slate-400 hover:text-slate-700" @click="closeCreateFolder()">close</button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">名称</label>
                <input
                  v-model="folderForm.title"
                  class="mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  maxlength="32"
                  placeholder="例如：前端资料"
                  required
                />
              </div>
              <div>
                <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">简介</label>
                <textarea
                  v-model="folderForm.abstract"
                  class="mt-1 w-full resize-none rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                  placeholder="简单描述这个收藏夹"
                ></textarea>
              </div>
              <div>
                <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">封面 URL</label>
                <input
                  v-model="folderForm.cover"
                  class="mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div v-if="folderError" class="mt-4 rounded-lg bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {{ folderError }}
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button type="button" class="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg" :disabled="folderSaving" @click="closeCreateFolder()">取消</button>
              <button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" :disabled="folderSaving">
                <span v-if="folderSaving" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                {{ folderSaving ? '创建中...' : '创建' }}
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="editingFolder" class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-sm">
          <form class="w-full max-w-md rounded-lg bg-surface-container-lowest p-6 shadow-[0_10px_30px_rgba(25,28,30,0.10)]" @submit.prevent="saveFolder">
            <div class="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 class="text-lg font-extrabold text-on-surface">编辑收藏夹</h3>
                <p class="mt-1 text-xs text-on-surface-variant">更新名称、简介和封面。</p>
              </div>
              <button type="button" class="material-symbols-outlined text-slate-400 hover:text-slate-700" @click="closeEditFolder">close</button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">名称</label>
                <input v-model="editFolderForm.title" class="mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" maxlength="32" required />
              </div>
              <div>
                <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">简介</label>
                <textarea v-model="editFolderForm.abstract" class="mt-1 w-full resize-none rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" rows="3"></textarea>
              </div>
              <div>
                <label class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">封面 URL</label>
                <input v-model="editFolderForm.cover" class="mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div v-if="folderError" class="mt-4 rounded-lg bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {{ folderError }}
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button type="button" class="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg" :disabled="folderSaving" @click="closeEditFolder">取消</button>
              <button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" :disabled="folderSaving">
                <span v-if="folderSaving" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                {{ folderSaving ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMessageStore } from '@/stores/message'
import { getCaptcha } from '@/api/captcha'
import { updateProfile, getLoginLog, sendEmailCode, resetEmail } from '@/api/user'
import {
  createCollectFolder,
  getCollectFolders,
  getCollectArticles,
  updateCollectFolder,
  deleteCollectFolder,
  getArticleList,
  getArticleHistory,
  deleteArticleHistory,
  deleteArticle,
  topArticle,
  cancelTopArticle
} from '@/api/article'
import { getChatSessions } from '@/api/chat'
import AIChatWidget from '@/components/common/AIChatWidget.vue'

const router = useRouter()
const userStore = useUserStore()
const messageStore = useMessageStore()

const activeTab = ref('collections')
const collectFolders = ref([])
const selectedFolder = ref(null)
const folderArticles = ref([])
const myArticles = ref([])
const historyList = ref([])
const sessions = ref([])
const loginLogs = ref([])
const showCreateFolder = ref(false)
const editingFolder = ref(null)
const folderForm = ref({ title: '', abstract: '', cover: '' })
const editFolderForm = ref({ title: '', abstract: '', cover: '' })
const profileForm = ref({
  nickName: '',
  avatar: '',
  abstract: '',
  Age: 0,
  likeTagsText: '',
  contactInfoText: '',
  openCollect: true,
  openFollow: true,
  openFans: true
})
const resetEmailForm = ref({
  email: '',
  captchaID: '',
  captchaCode: '',
  emailID: '',
  resetEmailID: '',
  emailCode: '',
  resetEmailCode: ''
})
const resetEmailCaptcha = ref(null)
const folderSaving = ref(false)
const folderActionKey = ref('')
const folderError = ref('')
const profileSaving = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const resetEmailCaptchaLoading = ref(false)
const resetEmailSending = ref(false)
const resetEmailSaving = ref(false)
const resetEmailCountdown = ref(0)
const resetEmailError = ref('')
const resetEmailSuccess = ref('')
const errorMsg = ref('')
const collectionsLoading = ref(false)
const folderArticlesLoading = ref(false)
const articlesLoading = ref(false)
const articleActionKey = ref('')
const historyLoading = ref(false)
const historyActionKey = ref('')
const sessionsLoading = ref(false)
const loginLogsLoading = ref(false)
const loginLogsError = ref('')

const totalUnread = computed(() => messageStore.getTotalUnread())

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  if (!userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
  fillProfileForm()
  fetchCollectFolders()
  fetchMyArticles()
  fetchHistory()
  fetchSessions()
  fetchLoginLogs()
  fetchResetEmailCaptcha()
})

function fillProfileForm() {
  const info = userStore.userInfo || {}
  const contactInfo = info.contactInfo && typeof info.contactInfo === 'object' ? info.contactInfo : {}
  profileForm.value = {
    nickName: info.nickName || info.nickname || '',
    avatar: info.avatar || '',
    abstract: info.abstract || '',
    Age: info.Age || info.age || 0,
    likeTagsText: Array.isArray(info.likeTags) ? info.likeTags.join(', ') : '',
    contactInfoText: Object.entries(contactInfo).map(([key, value]) => `${key}=${value}`).join('\n'),
    openCollect: info.openCollect !== false,
    openFollow: info.openFollow !== false,
    openFans: info.openFans !== false
  }
}

function parseContactInfo(value) {
  const result = {}
  value.split('\n').map(line => line.trim()).filter(Boolean).forEach((line) => {
    const index = line.indexOf('=')
    if (index <= 0) return
    const key = line.slice(0, index).trim()
    const val = line.slice(index + 1).trim()
    if (key && val) result[key] = val
  })
  return result
}

async function saveProfile() {
  profileError.value = ''
  profileSuccess.value = ''
  const tags = profileForm.value.likeTagsText.split(/[,，\n]/).map(item => item.trim()).filter(Boolean)
  if (tags.length > 36) {
    profileError.value = '兴趣标签不能超过 36 个'
    return
  }
  profileSaving.value = true
  try {
    await updateProfile({
      nickName: profileForm.value.nickName.trim(),
      avatar: profileForm.value.avatar.trim(),
      abstract: profileForm.value.abstract.trim(),
      Age: Number(profileForm.value.Age || 0),
      likeTags: tags,
      contactInfo: parseContactInfo(profileForm.value.contactInfoText),
      openCollect: profileForm.value.openCollect,
      openFollow: profileForm.value.openFollow,
      openFans: profileForm.value.openFans
    })
    await userStore.fetchUserInfo()
    fillProfileForm()
    profileSuccess.value = '资料已保存'
  } catch (e) {
    profileError.value = e.message || '资料保存失败'
  } finally {
    profileSaving.value = false
  }
}

async function fetchLoginLogs() {
  loginLogsLoading.value = true
  loginLogsError.value = ''
  try {
    const res = await getLoginLog({ type: 'user', page: 1, limit: 20 })
    loginLogs.value = res.data?.list || []
  } catch (e) {
    loginLogsError.value = e.message || '登录日志加载失败'
  } finally {
    loginLogsLoading.value = false
  }
}

async function fetchResetEmailCaptcha() {
  resetEmailCaptchaLoading.value = true
  resetEmailError.value = ''
  try {
    const res = await getCaptcha('重置邮箱')
    resetEmailCaptcha.value = res.data
    resetEmailForm.value.captchaID = res.data?.captchaID || ''
    resetEmailForm.value.captchaCode = ''
  } catch (e) {
    resetEmailError.value = e.message || '图形验证码加载失败'
  } finally {
    resetEmailCaptchaLoading.value = false
  }
}

function startResetEmailCountdown() {
  resetEmailCountdown.value = 60
  const timer = window.setInterval(() => {
    resetEmailCountdown.value -= 1
    if (resetEmailCountdown.value <= 0) {
      window.clearInterval(timer)
    }
  }, 1000)
}

async function sendResetEmailCodes() {
  resetEmailError.value = ''
  resetEmailSuccess.value = ''
  if (!resetEmailForm.value.email.trim()) {
    resetEmailError.value = '请填写新邮箱'
    return
  }
  if (!resetEmailForm.value.captchaID || !resetEmailForm.value.captchaCode.trim()) {
    resetEmailError.value = '请先填写图形验证码'
    return
  }

  resetEmailSending.value = true
  try {
    const res = await sendEmailCode({
      type: '重置邮箱',
      email: resetEmailForm.value.email.trim(),
      captchaID: resetEmailForm.value.captchaID,
      captchaCode: resetEmailForm.value.captchaCode.trim()
    })
    resetEmailForm.value.emailID = res.data?.emailID || ''
    resetEmailForm.value.resetEmailID = res.data?.resetEmailID || ''
    resetEmailSuccess.value = '验证码已发送，请检查当前邮箱和新邮箱'
    startResetEmailCountdown()
  } catch (e) {
    resetEmailError.value = e.message || '邮箱验证码发送失败'
    await fetchResetEmailCaptcha()
  } finally {
    resetEmailSending.value = false
  }
}

async function submitResetEmail() {
  resetEmailError.value = ''
  resetEmailSuccess.value = ''
  if (!resetEmailForm.value.emailID || !resetEmailForm.value.resetEmailID) {
    resetEmailError.value = '请先发送邮箱验证码'
    return
  }
  if (!resetEmailForm.value.emailCode.trim() || !resetEmailForm.value.resetEmailCode.trim()) {
    resetEmailError.value = '请填写当前邮箱和新邮箱验证码'
    return
  }

  resetEmailSaving.value = true
  try {
    await resetEmail({
      emailID: resetEmailForm.value.emailID,
      emailCode: resetEmailForm.value.emailCode.trim(),
      ResetEmailID: resetEmailForm.value.resetEmailID,
      ResetEmailCode: resetEmailForm.value.resetEmailCode.trim()
    })
    resetEmailSuccess.value = '邮箱已重置'
    resetEmailForm.value = {
      email: '',
      captchaID: '',
      captchaCode: '',
      emailID: '',
      resetEmailID: '',
      emailCode: '',
      resetEmailCode: ''
    }
    await userStore.fetchUserInfo()
    await fetchResetEmailCaptcha()
  } catch (e) {
    resetEmailError.value = e.message || '邮箱重置失败'
  } finally {
    resetEmailSaving.value = false
  }
}

async function fetchCollectFolders() {
  collectionsLoading.value = true
  errorMsg.value = ''
  try {
    const res = await getCollectFolders({ id: userStore.userInfo?.id, page: 1, limit: 50 })
    collectFolders.value = res.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '收藏夹加载失败'
  } finally {
    collectionsLoading.value = false
  }
}

async function fetchFolderArticles(folder) {
  selectedFolder.value = folder
  folderArticlesLoading.value = true
  errorMsg.value = ''
  try {
    const res = await getCollectArticles({ id: folder.id, page: 1, limit: 30 })
    folderArticles.value = res.data?.list || []
  } catch (e) {
    folderArticles.value = []
    errorMsg.value = e.message || '收藏夹文章加载失败'
  } finally {
    folderArticlesLoading.value = false
  }
}

async function fetchMyArticles() {
  articlesLoading.value = true
  errorMsg.value = ''
  try {
    const res = await getArticleList({ type: 'self', page: 1, limit: 50 })
    myArticles.value = res.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '文章加载失败'
  } finally {
    articlesLoading.value = false
  }
}

function editArticle(article) {
  router.push(`/user/editor/${article.id}`)
}

function isConfirmingDelete(id) {
  return articleActionKey.value === `confirm-delete-${id}` || articleActionKey.value === `delete-${id}`
}

function requestDeleteArticle(article) {
  articleActionKey.value = `confirm-delete-${article.id}`
  errorMsg.value = ''
}

async function toggleMyArticleTop(article) {
  articleActionKey.value = `top-${article.id}`
  errorMsg.value = ''
  try {
    if (article.userTop) {
      await cancelTopArticle({ articleID: article.id })
      article.userTop = false
    } else {
      await topArticle(article.id, { articleID: article.id })
      article.userTop = true
    }
    await fetchMyArticles()
  } catch (e) {
    errorMsg.value = e.message || '文章置顶操作失败'
  } finally {
    articleActionKey.value = ''
  }
}

async function deleteMyArticle(article) {
  articleActionKey.value = `delete-${article.id}`
  errorMsg.value = ''
  try {
    await deleteArticle({ IDList: [article.id] })
    await fetchMyArticles()
  } catch (e) {
    errorMsg.value = e.message || '文章删除失败'
  } finally {
    articleActionKey.value = ''
  }
}

async function fetchHistory() {
  historyLoading.value = true
  errorMsg.value = ''
  try {
    const res = await getArticleHistory({ type: 'user', page: 1, limit: 50 })
    historyList.value = res.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '浏览记录加载失败'
  } finally {
    historyLoading.value = false
  }
}

async function fetchSessions() {
  sessionsLoading.value = true
  try {
    const res = await getChatSessions({ page: 1, limit: 10 })
    sessions.value = res.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '会话列表加载失败'
  } finally {
    sessionsLoading.value = false
  }
}

function closeCreateFolder(force = false) {
  if (folderSaving.value && !force) return
  showCreateFolder.value = false
  folderError.value = ''
  folderForm.value = { title: '', abstract: '', cover: '' }
}

async function createFolder() {
  folderError.value = ''
  if (!folderForm.value.title.trim()) {
    folderError.value = '请填写收藏夹名称'
    return
  }

  folderSaving.value = true
  try {
    await createCollectFolder({
      title: folderForm.value.title.trim(),
      abstract: folderForm.value.abstract.trim(),
      cover: folderForm.value.cover.trim()
    })
    closeCreateFolder(true)
    await fetchCollectFolders()
  } catch (e) {
    folderError.value = e.message || '收藏夹创建失败'
  } finally {
    folderSaving.value = false
  }
}

function openFolder(folder) {
  fetchFolderArticles(folder)
}

function closeFolderDetail() {
  selectedFolder.value = null
  folderArticles.value = []
}

function startEditFolder(folder) {
  editingFolder.value = folder
  editFolderForm.value = {
    title: folder.title || '',
    abstract: folder.abstract || '',
    cover: folder.cover || ''
  }
  folderError.value = ''
}

function closeEditFolder() {
  if (folderSaving.value) return
  editingFolder.value = null
  folderError.value = ''
  editFolderForm.value = { title: '', abstract: '', cover: '' }
}

async function saveFolder() {
  if (!editingFolder.value) return
  folderError.value = ''
  if (!editFolderForm.value.title.trim()) {
    folderError.value = '请填写收藏夹名称'
    return
  }
  folderSaving.value = true
  try {
    await updateCollectFolder({
      id: editingFolder.value.id,
      title: editFolderForm.value.title.trim(),
      abstract: editFolderForm.value.abstract.trim(),
      cover: editFolderForm.value.cover.trim()
    })
    const folderId = editingFolder.value.id
    closeEditFolder()
    await fetchCollectFolders()
    const refreshed = collectFolders.value.find(folder => folder.id === folderId)
    if (refreshed && selectedFolder.value?.id === folderId) {
      selectedFolder.value = refreshed
    }
  } catch (e) {
    folderError.value = e.message || '收藏夹更新失败'
  } finally {
    folderSaving.value = false
  }
}

async function deleteFolder(folder) {
  if (folder.isDefault) return
  folderActionKey.value = `delete-${folder.id}`
  errorMsg.value = ''
  try {
    await deleteCollectFolder({ IDList: [folder.id] })
    if (selectedFolder.value?.id === folder.id) {
      closeFolderDetail()
    }
    await fetchCollectFolders()
  } catch (e) {
    errorMsg.value = e.message || '收藏夹删除失败'
  } finally {
    folderActionKey.value = ''
  }
}

async function deleteHistoryItem(id) {
  historyActionKey.value = `delete-${id}`
  errorMsg.value = ''
  try {
    await deleteArticleHistory({ IDList: [id] })
    await fetchHistory()
  } catch (e) {
    errorMsg.value = e.message || '浏览记录删除失败'
  } finally {
    historyActionKey.value = ''
  }
}

async function clearCurrentHistory() {
  const ids = historyList.value.map(item => item.id).filter(Boolean)
  if (ids.length === 0) return
  historyActionKey.value = 'clear'
  errorMsg.value = ''
  try {
    await deleteArticleHistory({ IDList: ids })
    await fetchHistory()
  } catch (e) {
    errorMsg.value = e.message || '浏览记录清理失败'
  } finally {
    historyActionKey.value = ''
  }
}

function openChat(session) {
  router.push({ name: 'Messages', query: { userId: session.userID } })
}

function statusText(status) {
  const map = { 0: '草稿', 1: '审核中', 2: '已发布', 3: '已下线' }
  return map[status] || '未知'
}

function statusClass(status) {
  const map = { 0: 'bg-slate-100 text-slate-600', 1: 'bg-yellow-50 text-yellow-700', 2: 'bg-green-50 text-green-700', 3: 'bg-red-50 text-red-700' }
  return map[status] || 'bg-slate-100 text-slate-600'
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分钟前`
  return `${Math.floor(mins / 60)}小时前`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>
