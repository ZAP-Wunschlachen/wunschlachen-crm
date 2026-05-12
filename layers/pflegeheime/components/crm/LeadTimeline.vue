<template>
  <div>
    <!-- Comment input -->
    <div class="mb-6">
      <textarea
        v-model="newComment"
        placeholder="Kommentar schreiben..."
        rows="3"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#172774]/20 focus:border-[#172774]"
      />
      <div class="flex justify-end mt-2">
        <button
          :disabled="!newComment.trim() || submitting"
          class="px-4 py-1.5 text-sm bg-[#172774] text-white rounded-lg hover:bg-[#3d4a8e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          @click="submitComment"
        >
          <i v-if="submitting" class="pi pi-spin pi-spinner text-xs mr-1" />
          Senden
        </button>
      </div>
    </div>

    <!-- Comments list -->
    <div v-if="loadingComments" class="flex justify-center py-8">
      <i class="pi pi-spin pi-spinner text-gray-400" />
    </div>

    <div v-else-if="comments.length === 0" class="text-sm text-gray-400 text-center py-8">
      Noch keine Kommentare
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex gap-3"
      >
        <!-- Avatar -->
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold flex-shrink-0 mt-0.5">
          {{ commentUserInitials(comment) }}
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-900">
              {{ commentUserName(comment) }}
            </span>
            <span class="text-xs text-gray-400">
              {{ formatCommentDate(comment.date_created) }}
            </span>
          </div>
          <div class="text-sm text-gray-600 mt-1 whitespace-pre-wrap" v-html="comment.comment" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

const USE_LOCAL = false
const STORAGE_KEY = 'crm_comments'

const props = defineProps<{
  collection: string
  itemId: string
}>()

const config = useRuntimeConfig()
const baseURL = config.public.directusUrl || 'http://localhost:8080'
const { refreshToken, redirectToLogout } = useAuth()

interface DirectusComment {
  id: string
  comment: string
  date_created: string
  user_created: {
    first_name?: string
    last_name?: string
    email?: string
  } | string
}

const comments = ref<DirectusComment[]>([])
const newComment = ref('')
const submitting = ref(false)
const loadingComments = ref(false)

// ─── LOCAL implementations ──────────────────────────────────────

const getStorageKey = () => `${STORAGE_KEY}_${props.collection}_${props.itemId}`

const fetchCommentsLocal = () => {
  try {
    const stored = localStorage.getItem(getStorageKey())
    if (stored) {
      comments.value = JSON.parse(stored)
    } else {
      comments.value = []
    }
  } catch {
    comments.value = []
  }
}

const saveCommentsLocal = () => {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(comments.value))
  } catch { /* ignore */ }
}

const submitCommentLocal = () => {
  const comment: DirectusComment = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    comment: newComment.value.trim(),
    date_created: new Date().toISOString(),
    user_created: { first_name: 'Du', last_name: '' },
  }
  comments.value.unshift(comment)
  saveCommentsLocal()
  newComment.value = ''
}

// ─── Directus implementations ───────────────────────────────────

const fetchCommentsRemote = async () => {
  try {
    const params = new URLSearchParams({
      'filter[collection][_eq]': props.collection,
      'filter[item][_eq]': props.itemId,
      'sort': '-date_created',
      'fields': 'id,comment,date_created,user_created.first_name,user_created.last_name,user_created.email',
    })
    let response = await fetch(
      `${baseURL}/secure-data/items/directus_comments?${params.toString()}`,
      { credentials: 'include' }
    )
    if (response.status === 401 || response.status === 403) {
      const refreshed = await refreshToken()
      if (refreshed) {
        response = await fetch(
          `${baseURL}/secure-data/items/directus_comments?${params.toString()}`,
          { credentials: 'include' }
        )
      } else {
        redirectToLogout()
        return
      }
    }
    if (response.ok) {
      const data = await response.json()
      comments.value = data.data || []
    }
  } catch (err) {
    console.error('Failed to load comments:', err)
  }
}

const submitCommentRemote = async () => {
  try {
    const payload = {
      collection: props.collection,
      item: props.itemId,
      comment: newComment.value.trim(),
    }
    let response = await fetch(
      `${baseURL}/secure-data/items/directus_comments`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    if (response.status === 401 || response.status === 403) {
      const refreshed = await refreshToken()
      if (refreshed) {
        response = await fetch(
          `${baseURL}/secure-data/items/directus_comments`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        )
      } else {
        redirectToLogout()
        return
      }
    }
    if (response.ok) {
      newComment.value = ''
      await fetchCommentsRemote()
    }
  } catch (err) {
    console.error('Failed to submit comment:', err)
  }
}

// ─── Public API ─────────────────────────────────────────────────

const fetchComments = async () => {
  loadingComments.value = true
  if (USE_LOCAL) {
    fetchCommentsLocal()
  } else {
    await fetchCommentsRemote()
  }
  loadingComments.value = false
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  submitting.value = true
  if (USE_LOCAL) {
    submitCommentLocal()
  } else {
    await submitCommentRemote()
  }
  submitting.value = false
}

const commentUserName = (comment: DirectusComment) => {
  if (typeof comment.user_created === 'object' && comment.user_created) {
    return [comment.user_created.first_name, comment.user_created.last_name]
      .filter(Boolean).join(' ') || 'Unbekannt'
  }
  return 'Unbekannt'
}

const commentUserInitials = (comment: DirectusComment) => {
  if (typeof comment.user_created === 'object' && comment.user_created) {
    const f = comment.user_created.first_name?.[0] || ''
    const l = comment.user_created.last_name?.[0] || ''
    return (f + l).toUpperCase() || '?'
  }
  return '?'
}

const formatCommentDate = (dateStr?: string) => {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), 'dd.MM.yy HH:mm', { locale: de })
  } catch {
    return ''
  }
}

onMounted(fetchComments)
</script>
