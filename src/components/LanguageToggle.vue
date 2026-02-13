<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const current = computed(() => locale.value)

function setLang(lang: 'ko' | 'en') {
  locale.value = lang
  localStorage.setItem('lang', lang)
}
</script>

<template>
  <div class="lang-toggle" role="group" aria-label="language toggle">
    <button :class="{ active: current === 'ko' }" @click="setLang('ko')">한국어</button>
    <button :class="{ active: current === 'en' }" @click="setLang('en')">English</button>
  </div>
</template>
