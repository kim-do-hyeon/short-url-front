<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import LanguageToggle from './components/LanguageToggle.vue'
import { clearAuth, getAuthEmail, isAuthenticated, onAuthChanged } from './services/auth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const email = ref<string | null>(getAuthEmail())
const loggedIn = computed(() => isAuthenticated())
const isMinimalPage = computed(() => route.name === 'go')
let unbind: (() => void) | null = null

function logout() {
  clearAuth()
  router.push('/auth')
}

onMounted(() => {
  unbind = onAuthChanged(() => {
    email.value = getAuthEmail()
  })
})

watch(
  () => isMinimalPage.value,
  (minimal) => {
    document.body.classList.toggle('clean-bg', minimal)
  },
  { immediate: true },
)

onUnmounted(() => {
  unbind?.()
  document.body.classList.remove('clean-bg')
})
</script>

<template>
  <div class="app-shell" :class="{ minimal: isMinimalPage }">
    <template v-if="!isMinimalPage">
      <header class="topbar">
        <div>
          <h1>{{ t('appTitle') }}</h1>
          <p>{{ t('appSubtitle') }}</p>
        </div>
        <div class="topbar-actions">
          <LanguageToggle />
          <RouterLink v-if="!loggedIn" to="/auth" class="btn mini">{{ t('nav.login') }}</RouterLink>
        </div>
      </header>

      <nav class="nav-tabs">
        <RouterLink to="/">{{ t('nav.create') }}</RouterLink>
        <RouterLink to="/admin">{{ t('nav.admin') }}</RouterLink>
        <span v-if="loggedIn" class="account-chip">{{ email }}</span>
        <button v-if="loggedIn" type="button" class="btn ghost mini" @click="logout">{{ t('nav.logout') }}</button>
      </nav>
    </template>

    <main>
      <RouterView />
    </main>
  </div>
</template>
