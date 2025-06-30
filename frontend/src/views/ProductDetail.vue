<template>
  <div class="product-detail">
    <h1>Product Detail</h1>
    <p>Product detail page is under construction.</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import logger from '../utils/logger'

onMounted(() => {
  logger.info('Product detail page mounted')
})
</script>

<style scoped>
.product-detail {
  padding: 2rem;
  text-align: center;
}
</style> 