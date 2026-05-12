<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 p-4">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-dental-blue-0/10 flex items-center justify-center flex-shrink-0">
          <img
            v-if="review.reviewer.profilePhotoUrl"
            :src="review.reviewer.profilePhotoUrl"
            :alt="review.reviewer.displayName"
            class="w-8 h-8 rounded-full object-cover"
          />
          <span v-else class="text-[10px] font-bold text-dental-blue-0">
            {{ review.reviewer.displayName.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <p class="text-sm font-medium text-dental-blue-0">{{ review.reviewer.displayName }}</p>
          <p class="text-[10px] text-dental-blue--3">{{ formatDate(review.createTime) }}</p>
        </div>
      </div>
      <!-- Reply status -->
      <span
        class="text-[10px] px-2 py-0.5 rounded-full"
        :class="review.reviewReply
          ? 'bg-green-50 text-green-700'
          : 'bg-amber-50 text-amber-700'"
      >
        {{ review.reviewReply ? 'Beantwortet' : 'Unbeantwortet' }}
      </span>
    </div>

    <!-- Stars -->
    <div class="flex items-center gap-0.5 mt-2">
      <i
        v-for="star in 5"
        :key="star"
        class="pi text-[12px]"
        :class="star <= review.starRating ? 'pi-star-fill text-amber-400' : 'pi-star text-dental-blue--4'"
      />
    </div>

    <!-- Comment -->
    <p
      v-if="review.comment"
      class="text-xs text-dental-blue--1 mt-2 leading-relaxed"
      :class="{ 'line-clamp-3': compact }"
    >
      {{ review.comment }}
    </p>
    <p v-else class="text-xs text-dental-blue--3 mt-2 italic">Keine Rezension geschrieben</p>

    <!-- Reply -->
    <div v-if="review.reviewReply" class="mt-3 pl-3 border-l-2 border-dental-blue--5">
      <p class="text-[10px] font-medium text-dental-blue--2 mb-1">Antwort des Inhabers</p>
      <p class="text-xs text-dental-blue--2 leading-relaxed" :class="{ 'line-clamp-2': compact }">
        {{ review.reviewReply.comment }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GoogleReview } from '~/composables/useGoogleReviews'

defineProps<{
  review: GoogleReview
  compact?: boolean
}>()

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return date
  }
}
</script>
