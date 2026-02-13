<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { fetchPublicLinkInfo, resolveLink } from '../services/api'

const route = useRoute()
const { t } = useI18n()

const code = computed(() => String(route.params.code || ''))
const loading = ref(true)
const resolving = ref(false)
const error = ref('')
const requiresPassword = ref(false)
const password = ref('')
const destination = ref('')

async function loadMeta() {
  loading.value = true
  error.value = ''

  try {
    const info = await fetchPublicLinkInfo(code.value)
    requiresPassword.value = info.password_protected
    if (!info.password_protected && info.original_url) {
      destination.value = info.original_url
    }
  } catch (e: any) {
    error.value = e?.response?.data?.detail || t('errors.fetchFailed')
  } finally {
    loading.value = false
  }
}

async function unlock() {
  if (!password.value || resolving.value) return
  resolving.value = true
  error.value = ''

  try {
    destination.value = await resolveLink(code.value, password.value)
  } catch (e: any) {
    error.value = e?.response?.data?.detail || t('go.invalidPassword')
  } finally {
    resolving.value = false
  }
}

function moveNow() {
  if (!destination.value) return
  window.location.href = destination.value
}

onMounted(loadMeta)
</script>

<template>
  <section class="panel gate-wrap">
    <h2>{{ t('go.title') }}</h2>

    <p v-if="loading">{{ t('go.loading') }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="!loading" class="gate-card">
      <p>
        <strong>{{ t('go.code') }}:</strong>
        <code>{{ code }}</code>
      </p>

      <div v-if="requiresPassword && !destination" class="gate-password">
        <p>{{ t('go.needPassword') }}</p>
        <input v-model="password" type="password" :placeholder="t('go.passwordPlaceholder')" />
        <button class="btn primary" @click="unlock">
          {{ resolving ? '...' : t('go.unlock') }}
        </button>
      </div>

      <div v-if="destination" class="gate-destination">
        <p><strong>{{ t('go.destination') }}</strong></p>
        <a :href="destination" target="_blank" rel="noopener noreferrer">{{ destination }}</a>
        <button class="btn" @click="moveNow">{{ t('go.move') }}</button>
      </div>
    </div>
  </section>
</template>
