<template>
  <div class="login">
    <h1>Login</h1>
    <p>Login page is under construction.</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import logger from '../utils/logger'

onMounted(() => {
  logger.info('Login page mounted')
})
</script>

<style scoped>
.login {
  padding: 2rem;
  text-align: center;
}
</style> 