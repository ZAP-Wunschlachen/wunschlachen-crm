<template>
  <div class="p-6 max-w-4xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-dental-blue-0">Google Bewertungen</h1>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 text-xs font-medium text-dental-blue-0 bg-dental-blue-0/10 rounded-lg hover:bg-dental-blue-0/20 transition-colors"
          :disabled="isLoading"
          @click="refresh"
        >
          <i class="pi pi-refresh text-[10px] mr-1" :class="{ 'pi-spin': isLoading }" />
          Aktualisieren
        </button>
        <NuxtLink
          to="/crm/einstellungen/bewertungen"
          class="px-3 py-1.5 text-xs font-medium text-dental-blue--2 hover:text-dental-blue-0 transition-colors"
        >
          <i class="pi pi-cog text-[10px] mr-1" />
          Einstellungen
        </NuxtLink>
      </div>
    </div>

    <!-- Not configured -->
    <div v-if="!isConfigured" class="bg-white rounded-lg border border-dental-blue--5 p-12 text-center">
      <i class="pi pi-star text-4xl text-dental-blue--4 mb-3" />
      <p class="text-sm text-dental-blue--2 mb-3">
        Google Reviews ist noch nicht konfiguriert.
      </p>
      <NuxtLink
        to="/crm/einstellungen/bewertungen"
        class="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-dental-blue-0 rounded-lg hover:bg-dental-blue-1 transition-colors"
      >
        <i class="pi pi-cog text-xs" />
        Jetzt einrichten
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Summary -->
      <div class="bg-white rounded-lg border border-dental-blue--5 p-4 mb-6">
        <div class="flex items-center gap-6">
          <div class="text-center">
            <p class="text-3xl font-bold text-dental-blue-0">{{ getAverageRating }}</p>
            <div class="flex items-center gap-0.5 mt-1 justify-center">
              <i
                v-for="star in 5"
                :key="star"
                class="pi text-sm"
                :class="star <= Math.round(getAverageRating) ? 'pi-star-fill text-amber-400' : 'pi-star text-dental-blue--4'"
              />
            </div>
            <p class="text-[10px] text-dental-blue--3 mt-1">Durchschnitt</p>
          </div>
          <div class="border-l border-dental-blue--5 pl-6">
            <p class="text-2xl font-semibold text-dental-blue-0">{{ getReviewCount }}</p>
            <p class="text-xs text-dental-blue--3">Bewertungen gesamt</p>
          </div>
          <div class="border-l border-dental-blue--5 pl-6">
            <p class="text-2xl font-semibold" :class="getUnansweredCount > 0 ? 'text-amber-600' : 'text-green-600'">
              {{ getUnansweredCount }}
            </p>
            <p class="text-xs text-dental-blue--3">Unbeantwortet</p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="bg-white rounded-lg border border-dental-blue--5 p-12 text-center text-dental-blue--3">
        <i class="pi pi-spin pi-spinner text-xl mb-2" />
        <p class="text-sm">Bewertungen werden geladen...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        <i class="pi pi-exclamation-triangle mr-1" />
        {{ error }}
      </div>

      <!-- Reviews list -->
      <div v-else class="space-y-3">
        <PatientenGoogleReviewCard
          v-for="review in sortedReviews"
          :key="review.reviewId"
          :review="review"
        />

        <div v-if="reviews.length === 0" class="bg-white rounded-lg border border-dental-blue--5 p-12 text-center text-dental-blue--3 text-sm">
          Keine Bewertungen gefunden
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'crm', middleware: ['auth'] })

const {
  reviews,
  isLoading,
  error,
  isConfigured,
  fetchReviews,
  getAverageRating,
  getReviewCount,
  getUnansweredCount,
} = useGoogleReviews()

// Sort newest first (already sorted in composable, but ensure)
const sortedReviews = computed(() =>
  [...reviews.value].sort(
    (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime(),
  ),
)

const refresh = () => fetchReviews(true)

onMounted(async () => {
  if (isConfigured.value) {
    await fetchReviews()
  }
})
</script>
