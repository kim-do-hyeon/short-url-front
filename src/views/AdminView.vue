<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { fetchLinks, type LinkStats } from '../services/api'

const { t } = useI18n()

const items = ref<LinkStats[]>([])
const loading = ref(false)
const error = ref('')

function shortUrl(item: LinkStats): string {
  const apiBase = (import.meta.env.VITE_API_BASE || 'http://localhost:8000').replace(/\/+$/, '')
  return `${apiBase}/${item.code}`
}

function openUrl(item: LinkStats): string {
  if (item.password_protected) {
    return `${window.location.origin}/go/${item.code}`
  }
  return shortUrl(item)
}

function policyText(item: LinkStats): string {
  const tokens: string[] = []
  if (item.password_protected) tokens.push('PW')
  if (item.max_clicks) tokens.push(`MAX:${item.max_clicks}`)
  if (item.one_time) tokens.push('ONE')
  if (item.expires_at) tokens.push('EXP')
  return tokens.length ? tokens.join(' / ') : '-'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await fetchLinks()
  } catch (e: any) {
    error.value = e?.response?.data?.detail || t('errors.fetchFailed')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <div>
        <h2>{{ t('admin.title') }}</h2>
        <p>{{ t('admin.subtitle') }}</p>
      </div>
      <button class="btn" @click="load">{{ loading ? '...' : t('admin.refresh') }}</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="!loading && items.length === 0">{{ t('admin.empty') }}</p>

    <div class="table-wrap" v-if="items.length > 0">
      <table>
        <thead>
          <tr>
            <th>{{ t('admin.columns.code') }}</th>
            <th>{{ t('admin.columns.short') }}</th>
            <th>{{ t('admin.columns.original') }}</th>
            <th>{{ t('admin.columns.created') }}</th>
            <th>{{ t('admin.columns.expires') }}</th>
            <th>{{ t('admin.columns.clicks') }}</th>
            <th>{{ t('admin.columns.policy') }}</th>
            <th>{{ t('admin.columns.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.code">
            <td><code>{{ item.code }}</code></td>
            <td>
              <a :href="openUrl(item)" target="_blank" rel="noopener noreferrer">{{ openUrl(item) }}</a>
            </td>
            <td>
              <a :href="item.original_url" target="_blank" rel="noopener noreferrer">{{ item.original_url }}</a>
            </td>
            <td>{{ new Date(item.created_at).toLocaleString() }}</td>
            <td>{{ item.expires_at ? new Date(item.expires_at).toLocaleString() : '-' }}</td>
            <td>{{ item.click_count }}</td>
            <td>{{ policyText(item) }}</td>
            <td>
              <span class="badge" :class="item.active ? 'on' : 'off'">
                {{ item.active ? t('labels.active') : t('labels.inactive') }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
