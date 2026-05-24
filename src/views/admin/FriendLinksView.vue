<template>
  <div class="p-8">
    <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      <h2 class="text-xl font-extrabold tracking-tighter text-blue-900">友链管理</h2>
      <div class="flex flex-wrap gap-3">
        <div class="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="rounded-lg px-4 py-2 text-xs font-bold transition-colors"
            :class="activeTab === tab.value ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
        <button
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
          @click="activeTab === 'links' ? showCreateLink = true : showCreatePromotion = true"
        >
          <span class="material-symbols-outlined text-base">add</span>
          {{ activeTab === 'links' ? '添加友链' : '添加推广' }}
        </button>
      </div>
    </header>

    <div v-if="errorMsg" class="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      {{ errorMsg }}
    </div>
    <div v-if="successMsg" class="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
      {{ successMsg }}
    </div>

    <section v-show="activeTab === 'links'">
      <div v-if="showCreateLink" class="bg-white p-6 rounded-2xl border border-slate-100 mb-8">
        <h3 class="font-bold mb-4">新建友链</h3>
        <LinkForm v-model="newLink" />
        <div class="flex gap-3 mt-4">
          <button class="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl disabled:cursor-not-allowed disabled:opacity-60" :disabled="creatingKey === 'link'" @click="createNewLink">
            <span v-if="creatingKey === 'link'" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
            {{ creatingKey === 'link' ? '创建中...' : '创建' }}
          </button>
          <button class="px-6 py-2 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50" :disabled="creatingKey === 'link'" @click="cancelCreateLink">取消</button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">名称</th>
              <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">URL</th>
              <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">排序</th>
              <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">状态</th>
              <th class="px-6 py-3 text-left text-[10px] uppercase tracking-widest text-slate-500 font-bold">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="loadingLinks">
              <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载友链中</p>
              </td>
            </tr>
            <tr v-for="link in links" :key="link.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4">
                <div v-if="editingLinkId === link.id" class="min-w-96">
                  <LinkForm v-model="editLink" compact />
                </div>
                <template v-else>
                  <p class="font-medium text-slate-900">{{ link.name }}</p>
                  <p class="text-[10px] uppercase tracking-widest text-slate-400">ID {{ link.id }}</p>
                </template>
              </td>
              <td class="px-6 py-4 text-slate-500 text-xs">{{ link.url }}</td>
              <td class="px-6 py-4 text-slate-500">{{ link.sort_order || 0 }}</td>
              <td class="px-6 py-4">
                <span class="text-[10px] font-bold px-2 py-1 rounded-full" :class="link.is_show ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'">
                  {{ link.is_show ? '显示' : '隐藏' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div v-if="editingLinkId === link.id" class="flex flex-wrap gap-2">
                  <button class="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline disabled:opacity-50" :disabled="actionKey === `link-save-${link.id}`" @click="saveLink(link.id)">
                    <span v-if="actionKey === `link-save-${link.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    保存
                  </button>
                  <button class="text-[10px] font-bold text-slate-500 hover:underline disabled:opacity-50" :disabled="actionKey === `link-save-${link.id}`" @click="cancelEditLink">取消</button>
                </div>
                <div v-else-if="confirmDeleteKey === `link-${link.id}`" class="flex flex-wrap gap-2">
                  <button class="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:underline disabled:opacity-50" :disabled="actionKey === `link-delete-${link.id}`" @click="deleteLink(link.id)">
                    <span v-if="actionKey === `link-delete-${link.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    确认删除
                  </button>
                  <button class="text-[10px] font-bold text-slate-500 hover:underline disabled:opacity-50" :disabled="actionKey === `link-delete-${link.id}`" @click="confirmDeleteKey = ''">取消</button>
                </div>
                <div v-else class="flex flex-wrap gap-2">
                  <button class="text-[10px] font-bold text-primary hover:underline" @click="startEditLink(link)">编辑</button>
                  <button class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:underline disabled:opacity-50" :disabled="actionKey === `link-toggle-${link.id}`" @click="toggleLink(link)">
                    <span v-if="actionKey === `link-toggle-${link.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    {{ link.is_show ? '隐藏' : '显示' }}
                  </button>
                  <button class="text-[10px] font-bold text-red-600 hover:underline" @click="confirmDeleteKey = `link-${link.id}`">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="!loadingLinks && links.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-sm text-slate-400">暂无友链</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-show="activeTab === 'promotions'">
      <div v-if="showCreatePromotion" class="bg-white p-6 rounded-2xl border border-slate-100 mb-8">
        <h3 class="font-bold mb-4">新建推广</h3>
        <PromotionForm v-model="newPromotion" />
        <div class="flex gap-3 mt-4">
          <button class="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl disabled:cursor-not-allowed disabled:opacity-60" :disabled="creatingKey === 'promotion'" @click="createNewPromotion">
            <span v-if="creatingKey === 'promotion'" class="material-symbols-outlined animate-spin text-base">progress_activity</span>
            {{ creatingKey === 'promotion' ? '创建中...' : '创建' }}
          </button>
          <button class="px-6 py-2 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50" :disabled="creatingKey === 'promotion'" @click="cancelCreatePromotion">取消</button>
        </div>
      </div>

      <div v-if="loadingPromotions" class="py-20 text-center text-slate-400">
        <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
        <p class="mt-2 text-xs font-bold uppercase tracking-widest">加载推广中</p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <article v-for="promotion in promotions" :key="promotion.id" class="bg-white rounded-2xl border border-slate-100 p-5">
          <div v-if="editingPromotionId === promotion.id" class="space-y-4">
            <PromotionForm v-model="editPromotion" compact />
            <div class="flex flex-wrap gap-2">
              <button class="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline disabled:opacity-50" :disabled="actionKey === `promotion-save-${promotion.id}`" @click="savePromotion(promotion.id)">
                <span v-if="actionKey === `promotion-save-${promotion.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                保存
              </button>
              <button class="text-[10px] font-bold text-slate-500 hover:underline disabled:opacity-50" :disabled="actionKey === `promotion-save-${promotion.id}`" @click="cancelEditPromotion">取消</button>
            </div>
          </div>
          <template v-else>
            <div class="flex gap-4">
              <img v-if="promotion.avatar" :src="promotion.avatar" :alt="promotion.friend_name || promotion.title" class="h-14 w-14 rounded-xl object-cover bg-slate-100" />
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="font-bold text-slate-900">{{ promotion.title }}</h3>
                    <p class="mt-1 text-xs text-slate-500">{{ promotion.friend_name || '-' }} · {{ promotion.category || '未分类' }}</p>
                  </div>
                  <span class="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full" :class="promotion.is_show ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'">
                    {{ promotion.is_show ? '显示' : '隐藏' }}
                  </span>
                </div>
                <p class="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{{ promotion.description || '暂无描述' }}</p>
                <div class="mt-3 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
                  <span class="rounded-full bg-slate-100 px-2 py-1">排序 {{ promotion.sort_order || 0 }}</span>
                  <span class="rounded-full bg-slate-100 px-2 py-1">{{ promotion.position || 'page' }}</span>
                </div>
              </div>
            </div>

            <div v-if="confirmDeleteKey === `promotion-${promotion.id}`" class="mt-4 flex flex-wrap gap-2">
              <button class="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 hover:underline disabled:opacity-50" :disabled="actionKey === `promotion-delete-${promotion.id}`" @click="deletePromotion(promotion.id)">
                <span v-if="actionKey === `promotion-delete-${promotion.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                确认删除
              </button>
              <button class="text-[10px] font-bold text-slate-500 hover:underline disabled:opacity-50" :disabled="actionKey === `promotion-delete-${promotion.id}`" @click="confirmDeleteKey = ''">取消</button>
            </div>
            <div v-else class="mt-4 flex flex-wrap gap-3">
              <button class="text-[10px] font-bold text-primary hover:underline" @click="startEditPromotion(promotion)">编辑</button>
              <button class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:underline disabled:opacity-50" :disabled="actionKey === `promotion-toggle-${promotion.id}`" @click="togglePromotion(promotion)">
                <span v-if="actionKey === `promotion-toggle-${promotion.id}`" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                {{ promotion.is_show ? '隐藏' : '显示' }}
              </button>
              <button class="text-[10px] font-bold text-red-600 hover:underline" @click="confirmDeleteKey = `promotion-${promotion.id}`">删除</button>
            </div>
          </template>
        </article>
      </div>

      <div v-if="!loadingPromotions && promotions.length === 0" class="py-16 text-center text-sm text-slate-400">
        暂无推广
      </div>
    </section>
  </div>
</template>

<script setup>
import { defineComponent, h, onMounted, ref } from 'vue'
import {
  getFriendLinks,
  createFriendLink,
  deleteFriendLink,
  updateFriendLink,
  getFriendPromotions,
  createFriendPromotion,
  deleteFriendPromotion,
  updateFriendPromotion
} from '@/api/friend'
import { useUiStore } from '@/stores/ui'

const tabs = [
  { value: 'links', label: '友链' },
  { value: 'promotions', label: '推广' }
]

const uiStore = useUiStore()
const activeTab = ref('links')
const links = ref([])
const promotions = ref([])
const showCreateLink = ref(false)
const showCreatePromotion = ref(false)
const newLink = ref(emptyLink())
const editLink = ref(emptyLink())
const newPromotion = ref(emptyPromotion())
const editPromotion = ref(emptyPromotion())
const loadingLinks = ref(false)
const loadingPromotions = ref(false)
const creatingKey = ref('')
const actionKey = ref('')
const editingLinkId = ref(null)
const editingPromotionId = ref(null)
const confirmDeleteKey = ref('')
const errorMsg = ref('')
const successMsg = ref('')

const fieldClass = 'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm mt-1 focus:ring-primary focus:ring-2 focus:outline-none'
const compactFieldClass = 'w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs mt-1 focus:ring-primary focus:ring-2 focus:outline-none'
const labelClass = 'text-[10px] uppercase tracking-widest text-slate-500 font-semibold'

const LinkForm = defineComponent({
  props: {
    modelValue: { type: Object, required: true },
    compact: { type: Boolean, default: false }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    function update(key, value) {
      emit('update:modelValue', { ...props.modelValue, [key]: value })
    }
    function field(label, key, type = 'text') {
      return h('div', [
        h('label', { class: labelClass }, label),
        h('input', {
          class: props.compact ? compactFieldClass : fieldClass,
          type,
          value: props.modelValue[key],
          onInput: event => update(key, type === 'number' ? Number(event.target.value || 0) : event.target.value)
        })
      ])
    }
    return () => h('div', { class: props.compact ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
      field('站点名称', 'name'),
      field('站点 URL', 'url'),
      field('Logo URL', 'logo'),
      field('排序权重', 'sort_order', 'number'),
      h('div', [
        h('label', { class: labelClass }, '备注'),
        h('textarea', {
          class: `${props.compact ? compactFieldClass : fieldClass} resize-none`,
          rows: props.compact ? 2 : 3,
          value: props.modelValue.remark,
          onInput: event => update('remark', event.target.value)
        })
      ]),
      h('label', { class: 'flex items-center gap-2 pt-5 text-sm text-slate-600' }, [
        h('input', {
          type: 'checkbox',
          checked: props.modelValue.is_show,
          onChange: event => update('is_show', event.target.checked)
        }),
        '显示'
      ])
    ])
  }
})

const PromotionForm = defineComponent({
  props: {
    modelValue: { type: Object, required: true },
    compact: { type: Boolean, default: false }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    function update(key, value) {
      emit('update:modelValue', { ...props.modelValue, [key]: value })
    }
    function field(label, key, type = 'text') {
      return h('div', [
        h('label', { class: labelClass }, label),
        h('input', {
          class: props.compact ? compactFieldClass : fieldClass,
          type,
          value: props.modelValue[key],
          onInput: event => update(key, type === 'number' ? Number(event.target.value || 0) : event.target.value)
        })
      ])
    }
    return () => h('div', { class: props.compact ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
      field('标题', 'title'),
      field('朋友名称', 'friend_name'),
      field('头像 URL', 'avatar'),
      field('分类', 'category'),
      field('位置', 'position'),
      field('排序权重', 'sort_order', 'number'),
      field('预览图数据', 'preview_images'),
      field('联系方式', 'contact_info_text'),
      h('div', { class: props.compact ? '' : 'md:col-span-2' }, [
        h('label', { class: labelClass }, '描述'),
        h('textarea', {
          class: `${props.compact ? compactFieldClass : fieldClass} resize-none`,
          rows: props.compact ? 3 : 4,
          value: props.modelValue.description,
          onInput: event => update('description', event.target.value)
        })
      ]),
      h('div', { class: props.compact ? '' : 'md:col-span-2' }, [
        h('label', { class: labelClass }, '备注'),
        h('textarea', {
          class: `${props.compact ? compactFieldClass : fieldClass} resize-none`,
          rows: 2,
          value: props.modelValue.remark,
          onInput: event => update('remark', event.target.value)
        })
      ]),
      h('label', { class: 'flex items-center gap-2 pt-5 text-sm text-slate-600' }, [
        h('input', {
          type: 'checkbox',
          checked: props.modelValue.is_show,
          onChange: event => update('is_show', event.target.checked)
        }),
        '显示'
      ])
    ])
  }
})

function emptyLink() {
  return { name: '', url: '', logo: '', is_show: true, sort_order: 0, remark: '' }
}

function emptyPromotion() {
  return {
    title: '',
    friend_name: '',
    avatar: '',
    category: '',
    description: '',
    preview_images: '',
    contact_info_text: '',
    is_show: true,
    sort_order: 0,
    position: 'page',
    remark: ''
  }
}

function setSuccess(message) {
  successMsg.value = message
  uiStore.notify(message, 'success')
}

function fail(message) {
  errorMsg.value = message
  uiStore.notify(message, 'warning')
  return false
}

function validateLink(form) {
  if (!form.name.trim()) return fail('请填写友链名称')
  if (!form.url.trim()) return fail('请填写友链 URL')
  return true
}

function validatePromotion(form) {
  if (!form.title.trim()) return fail('请填写推广标题')
  if (!form.friend_name.trim()) return fail('请填写朋友名称')
  return true
}

function promotionPayload(form) {
  return {
    title: form.title,
    friend_name: form.friend_name,
    avatar: form.avatar,
    category: form.category,
    description: form.description,
    preview_images: form.preview_images,
    contact_info: form.contact_info_text.split(/[\n,，]/).map(item => item.trim()).filter(Boolean),
    is_show: form.is_show,
    sort_order: Number(form.sort_order || 0),
    position: form.position || 'page',
    remark: form.remark
  }
}

function promotionToForm(promotion) {
  return {
    title: promotion.title || '',
    friend_name: promotion.friend_name || '',
    avatar: promotion.avatar || '',
    category: promotion.category || '',
    description: promotion.description || '',
    preview_images: promotion.preview_images || '',
    contact_info_text: Array.isArray(promotion.contact_info) ? promotion.contact_info.join('\n') : '',
    is_show: promotion.is_show !== false,
    sort_order: promotion.sort_order || 0,
    position: promotion.position || 'page',
    remark: promotion.remark || ''
  }
}

async function fetchLinks() {
  loadingLinks.value = true
  errorMsg.value = ''
  try {
    const res = await getFriendLinks()
    links.value = res.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '友链加载失败'
  } finally {
    loadingLinks.value = false
  }
}

async function fetchPromotions() {
  loadingPromotions.value = true
  errorMsg.value = ''
  try {
    const res = await getFriendPromotions()
    promotions.value = res.data?.list || []
  } catch (e) {
    errorMsg.value = e.message || '推广加载失败'
  } finally {
    loadingPromotions.value = false
  }
}

async function createNewLink() {
  if (!validateLink(newLink.value)) return
  creatingKey.value = 'link'
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await createFriendLink(newLink.value)
    cancelCreateLink()
    setSuccess('友链创建成功')
    await fetchLinks()
  } catch (e) {
    errorMsg.value = e.message || '友链创建失败'
  } finally {
    creatingKey.value = ''
  }
}

function cancelCreateLink() {
  showCreateLink.value = false
  newLink.value = emptyLink()
}

function startEditLink(link) {
  editingLinkId.value = link.id
  editLink.value = { ...emptyLink(), ...link }
  confirmDeleteKey.value = ''
  errorMsg.value = ''
  successMsg.value = ''
}

function cancelEditLink() {
  editingLinkId.value = null
  editLink.value = emptyLink()
}

async function saveLink(id) {
  if (!validateLink(editLink.value)) return
  actionKey.value = `link-save-${id}`
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await updateFriendLink(id, editLink.value)
    cancelEditLink()
    setSuccess('友链已更新')
    await fetchLinks()
  } catch (e) {
    errorMsg.value = e.message || '友链更新失败'
  } finally {
    actionKey.value = ''
  }
}

async function toggleLink(link) {
  actionKey.value = `link-toggle-${link.id}`
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await updateFriendLink(link.id, { ...emptyLink(), ...link, is_show: !link.is_show })
    setSuccess(link.is_show ? '友链已隐藏' : '友链已显示')
    await fetchLinks()
  } catch (e) {
    errorMsg.value = e.message || '友链状态更新失败'
  } finally {
    actionKey.value = ''
  }
}

async function deleteLink(id) {
  actionKey.value = `link-delete-${id}`
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await deleteFriendLink({ IDList: [id] })
    confirmDeleteKey.value = ''
    setSuccess('友链已删除')
    await fetchLinks()
  } catch (e) {
    errorMsg.value = e.message || '友链删除失败'
  } finally {
    actionKey.value = ''
  }
}

async function createNewPromotion() {
  if (!validatePromotion(newPromotion.value)) return
  creatingKey.value = 'promotion'
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await createFriendPromotion(promotionPayload(newPromotion.value))
    cancelCreatePromotion()
    setSuccess('推广创建成功')
    await fetchPromotions()
  } catch (e) {
    errorMsg.value = e.message || '推广创建失败'
  } finally {
    creatingKey.value = ''
  }
}

function cancelCreatePromotion() {
  showCreatePromotion.value = false
  newPromotion.value = emptyPromotion()
}

function startEditPromotion(promotion) {
  editingPromotionId.value = promotion.id
  editPromotion.value = promotionToForm(promotion)
  confirmDeleteKey.value = ''
  errorMsg.value = ''
  successMsg.value = ''
}

function cancelEditPromotion() {
  editingPromotionId.value = null
  editPromotion.value = emptyPromotion()
}

async function savePromotion(id) {
  if (!validatePromotion(editPromotion.value)) return
  actionKey.value = `promotion-save-${id}`
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await updateFriendPromotion(id, promotionPayload(editPromotion.value))
    cancelEditPromotion()
    setSuccess('推广已更新')
    await fetchPromotions()
  } catch (e) {
    errorMsg.value = e.message || '推广更新失败'
  } finally {
    actionKey.value = ''
  }
}

async function togglePromotion(promotion) {
  actionKey.value = `promotion-toggle-${promotion.id}`
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const payload = promotionPayload({ ...promotionToForm(promotion), is_show: !promotion.is_show })
    await updateFriendPromotion(promotion.id, payload)
    setSuccess(promotion.is_show ? '推广已隐藏' : '推广已显示')
    await fetchPromotions()
  } catch (e) {
    errorMsg.value = e.message || '推广状态更新失败'
  } finally {
    actionKey.value = ''
  }
}

async function deletePromotion(id) {
  actionKey.value = `promotion-delete-${id}`
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await deleteFriendPromotion({ IDList: [id] })
    confirmDeleteKey.value = ''
    setSuccess('推广已删除')
    await fetchPromotions()
  } catch (e) {
    errorMsg.value = e.message || '推广删除失败'
  } finally {
    actionKey.value = ''
  }
}

onMounted(() => {
  fetchLinks()
  fetchPromotions()
})
</script>
