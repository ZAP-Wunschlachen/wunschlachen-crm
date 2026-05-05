<template>
  <div class="border border-dental-blue--5 rounded-lg p-3">
    <div class="flex items-center justify-between mb-1">
      <p class="text-xs font-medium text-dental-blue-0">{{ review.reviewer.displayName }}</p>
      <div class="flex items-center gap-0.5">
        <i v-for="i in 5" :key="i" class="pi pi-star-fill text-[10px]" :class="i <= review.starRating ? 'text-amber-400' : 'text-dental-blue--5'" />
      </div>
    </div>
    <p class="text-[11px] text-dental-blue--2 line-clamp-3">{{ review.comment }}</p>
    <p class="text-[9px] text-dental-blue--3 mt-1">{{ formatDate(review.createTime) }}</p>
  </div>
</template>

<script setup lang="ts">
import type { GoogleReview } from '../../../composables/useGoogleReviews'

defineProps<{ review: GoogleReview }>()

const formatDate = (date: string) => {
  try { return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return date }
}
</script>
