<template>
  <div class="p-6 max-w-5xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-dental-blue-0">Google Bewertungen</h1>
      <button
        class="px-4 py-2 text-sm font-medium text-dental-blue-0 border border-dental-blue--5 rounded-lg hover:bg-[#ededed]"
        @click="refresh"
      >
        Aktualisieren
      </button>
    </div>

    <div v-if="!isConfigured" class="bg-white rounded-lg p-6 border border-dental-blue--5 text-center">
      <p class="text-sm text-dental-blue--3 mb-3">Google API nicht konfiguriert.</p>
      <button class="px-4 py-2 text-xs font-medium text-white bg-dental-blue-0 rounded-lg" @click="navigateTo('/patienten/einstellungen/bewertungen')">
        Einstellungen
      </button>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
          <p class="text-xs text-dental-blue--2">Durchschnitt</p>
          <p class="text-2xl font-bold text-dental-blue-0">{{ getAverageRating }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
          <p class="text-xs text-dental-blue--2">Bewertungen</p>
          <p class="text-2xl font-bold text-dental-blue-0">{{ getReviewCount }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 border border-dental-blue--5">
          <p class="text-xs text-dental-blue--2">Unbeantwortet</p>
          <p class="text-2xl font-bold text-amber-600">{{ getUnansweredCount }}</p>
        </div>
      </div>

      <!-- Reviews -->
      <div class="space-y-3">
        <PatientenGoogleReviewCard v-for="review in reviews" :key="review.reviewId" :review="review" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: ['auth'] })

const { reviews, isConfigured, fetchReviews, getAverageRating, getReviewCount, getUnansweredCount } = useGoogleReviews()

const refresh = () => fetchReviews(true)

onMounted(() => fetchReviews())
</script>
