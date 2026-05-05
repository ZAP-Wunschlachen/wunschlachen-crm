<template>
  <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-dental-blue-0">Google Bewertungen</h2>
      <NuxtLink to="/patienten/bewertungen" class="text-[10px] text-dental-blue--2 hover:text-dental-blue-0">Alle anzeigen</NuxtLink>
    </div>
    <div v-if="!isConfigured" class="text-xs text-dental-blue--3">Nicht konfiguriert</div>
    <template v-else>
      <div class="flex items-center gap-2 mb-3">
        <span class="text-lg font-bold text-dental-blue-0">{{ getAverageRating }}</span>
        <span class="text-xs text-dental-blue--3">({{ getReviewCount }} Bewertungen)</span>
      </div>
      <div class="space-y-2">
        <PatientenGoogleReviewCard v-for="review in getLatestReviews(3)" :key="review.reviewId" :review="review" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { isConfigured, fetchReviews, getAverageRating, getReviewCount, getLatestReviews } = useGoogleReviews()
onMounted(() => fetchReviews())
</script>
