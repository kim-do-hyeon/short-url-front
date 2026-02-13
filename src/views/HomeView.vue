<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { createShortLink, type LinkCreatePayload, type LinkCreateResponse } from '../services/api'
import { isAuthenticated } from '../services/auth'

const { t } = useI18n()

const form = reactive({
  originalUrl: '',
  customCode: '',
  ttlDays: undefined as number | undefined,
  expiresAt: '',
  password: '',
  maxClicks: undefined as number | undefined,
  oneTime: false,
})

const loading = ref(false)
const result = ref<LinkCreateResponse | null>(null)
const error = ref('')
const copied = ref(false)

const canSubmit = computed(() => !!form.originalUrl && !loading.value)
const displayShortUrl = computed(() => {
  if (!result.value) return ''
  if (result.value.password_protected) {
    return `${window.location.origin}/go/${result.value.code}`
  }
  return result.value.short_url
})

function reset() {
  form.originalUrl = ''
  form.customCode = ''
  form.ttlDays = undefined
  form.expiresAt = ''
  form.password = ''
  form.maxClicks = undefined
  form.oneTime = false
  result.value = null
  error.value = ''
}

async function submit() {
  if (!canSubmit.value) return
  if (!isAuthenticated()) {
    error.value = t('errors.authRequired')
    return
  }

  loading.value = true
  error.value = ''
  copied.value = false

  const payload: LinkCreatePayload = {
    original_url: form.originalUrl,
    one_time: form.oneTime,
  }

  if (form.customCode) payload.custom_code = form.customCode
  if (form.ttlDays) payload.ttl_days = Number(form.ttlDays)
  if (form.expiresAt) payload.expires_at = new Date(form.expiresAt).toISOString()
  if (form.password) payload.password = form.password
  if (form.maxClicks) payload.max_clicks = Number(form.maxClicks)

  try {
    result.value = await createShortLink(payload)
  } catch (e: any) {
    error.value = e?.response?.data?.detail || t('errors.createFailed')
  } finally {
    loading.value = false
  }
}

async function copyShortUrl() {
  if (!displayShortUrl.value) return
  await navigator.clipboard.writeText(displayShortUrl.value)
  copied.value = true
}
</script>

<template>
  <section class="panel">
    <h2>{{ t('form.title') }}</h2>
    <form class="form-grid" @submit.prevent="submit">
      <label>
        <span>{{ t('form.originalUrl') }}</span>
        <input v-model="form.originalUrl" type="url" required placeholder="https://example.com/campaign" />
      </label>

      <label>
        <span>{{ t('form.customCode') }}</span>
        <input v-model="form.customCode" type="text" placeholder="summer-sale-2026" />
      </label>

      <label>
        <span>{{ t('form.ttlDays') }}</span>
        <input v-model.number="form.ttlDays" type="number" min="1" max="3650" placeholder="30" />
      </label>

      <label>
        <span>{{ t('form.expiresAt') }}</span>
        <input v-model="form.expiresAt" type="datetime-local" />
      </label>

      <label>
        <span>{{ t('form.password') }}</span>
        <input v-model="form.password" type="password" minlength="4" placeholder="••••••••" />
      </label>

      <label>
        <span>{{ t('form.maxClicks') }}</span>
        <input v-model.number="form.maxClicks" type="number" min="1" placeholder="1000" />
      </label>

      <label class="policy-toggle">
        <input v-model="form.oneTime" type="checkbox" class="switch-input" />
        <span class="switch-ui" aria-hidden="true"></span>
        <span class="policy-copy">
          <strong>{{ t('form.oneTime') }}</strong>
          <small>{{ t('form.oneTimeDesc') }}</small>
        </span>
      </label>

      <div class="actions">
        <button :disabled="!canSubmit" type="submit" class="btn primary">
          {{ loading ? '...' : t('form.submit') }}
        </button>
        <button type="button" class="btn ghost" @click="reset">{{ t('form.reset') }}</button>
      </div>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="result" class="result-card">
      <p class="success">{{ t('form.success') }}</p>
      <a :href="displayShortUrl" target="_blank" rel="noopener noreferrer">{{ displayShortUrl }}</a>
      <div class="result-meta">
        <span>{{ t('labels.protected') }}: {{ result.password_protected ? t('labels.yes') : t('labels.no') }}</span>
        <span>{{ t('labels.expires') }}: {{ result.expires_at || '-' }}</span>
      </div>
      <p v-if="result.password_protected">{{ t('form.secureShared') }}</p>
      <button class="btn" @click="copyShortUrl">{{ copied ? t('form.copied') : 'Copy URL' }}</button>
    </div>
  </section>
</template>
