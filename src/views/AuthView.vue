<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { login, signup } from '../services/api'
import { isAuthenticated } from '../services/auth'

const { t } = useI18n()
const router = useRouter()

const mode = ref<'login' | 'signup'>(isAuthenticated() ? 'login' : 'signup')
const loading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
})

async function submit() {
  if (!form.email || !form.password || loading.value) return

  loading.value = true
  error.value = ''

  try {
    if (mode.value === 'signup') {
      await signup(form.email, form.password)
    } else {
      await login(form.email, form.password)
    }
    router.push('/admin')
  } catch (e: any) {
    error.value = e?.response?.data?.detail || t('auth.failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="panel auth-panel">
    <div class="auth-head">
      <h2>{{ t('auth.title') }}</h2>
      <p>{{ t('auth.subtitle') }}</p>
    </div>

    <div class="auth-tabs">
      <button class="btn" :class="{ primary: mode === 'signup' }" @click="mode = 'signup'">{{ t('auth.signup') }}</button>
      <button class="btn" :class="{ primary: mode === 'login' }" @click="mode = 'login'">{{ t('auth.login') }}</button>
    </div>

    <form class="auth-form" @submit.prevent="submit">
      <label>
        <span>{{ t('auth.email') }}</span>
        <input v-model="form.email" type="email" required placeholder="hello@example.com" />
      </label>
      <label>
        <span>{{ t('auth.password') }}</span>
        <input v-model="form.password" type="password" required minlength="8" placeholder="********" />
      </label>
      <button type="submit" class="btn primary">{{ loading ? '...' : (mode === 'signup' ? t('auth.signup') : t('auth.login')) }}</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>
