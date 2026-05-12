<template>
  <div class="bg-white rounded-lg border border-dental-blue--5 p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-dental-blue-0">Google Bewertungen</h3>
      <NuxtLink
        to="/crm/bewertungen"
        class="text-[10px] text-dental-blue--2 hover:text-dental-blue-0 transition-colors"
      >
        Alle anzeigen <i class="pi pi-arrow-right text-[8px] ml-0.5" />
      </NuxtLink>
    </div>

    <!-- Not configured -->
    <div v-if="!isConfigured" class="py-6 text-center">
      <i class="pi pi-star text-3xl text-dental-blue--4 mb-2" />
      <p class="text-xs text-dental-blue--3 mb-2">Google Reviews nicht konfiguriert</p>
      <NuxtLink
        to="/crm/einstellungen/bewertungen"
        class="text-xs text-dental-blue-0 hover:underline"
      >
        Jetzt einrichten
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-else-if="isLoading" class="py-6 text-center text-sm text-dental-blue--3">
      <i class="pi pi-spin pi-spinner mr-1" /> Laden...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="py-4 text-center text-xs text-red-500">
      <i class="pi pi-exclamation-triangle mr-1" />
      {{ error }}
    </div>

    <!-- Data -->
    <div v-else>
      <!-- Summary row -->
      <div class="flex items-center gap-4 mb-4 p-3 bg-[#ededed]/50 rounded-lg">
        <div class="text-center">
          <p class="text-2xl font-bold text-dental-blue-0">{{ getAverageRating }}</p>
          <div class="flex items-center gap-0.5 mt-0.5">
            <i
              v-for="star in 5"
              :key="star"
              class="pi text-[10px]"
              :class="star <= Math.round(getAverageRating) ? 'pi-star-fill text-amber-400' : 'pi-star text-dental-blue--4'"
            />
          </div>
        </div>
        <div class="border-l border-dental-blue--5 pl-4">
          <p class="text-lg font-semibold text-dental-blue-0">{{ getReviewCount }}</p>
          <p class="text-[10px] text-dental-blue--3">Bewertungen</p>
        </div>
        <div v-if="getUnansweredCount > 0" class="border-l border-dental-blue--5 pl-4">
          <p class="text-lg font-semibold text-amber-600">{{ getUnansweredCount }}</p>
          <p class="text-[10px] text-dental-blue--3">Unbeantwortet</p>
        </div>
      </div>

      <!-- Latest reviews -->
      <div class="space-y-2">
        <CrmGoogleReviewCard
          v-for="review in latestReviews"
          :key="review.reviewId"
          :review="review"
          :compact="true"
        />
      </div>

      <div v-if="reviews.length === 0" class="py-4 text-center text-xs text-dental-blue--3">
        Keine Bewertungen gefunden
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  reviews,
  isLoading,
  error,
  isConfigured,
  fetchReviews,
  getAverageRating,
  getReviewCount,
  getLatestReviews,
  getUnansweredCount,
} = useGoogleReviews()

const latestReviews = computed(() => getLatestReviews(5))

onMounted(async () => {
  if (isConfigured.value) {
    await fetchReviews()
  }
})
</script>
