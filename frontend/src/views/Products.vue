<template>
  <div class="products-page">
    <h1 class="title">Apple Products</h1>
    <div class="category-buttons">
      <button
        v-for="category in ['All', ...categories]"
        :key="category"
        @click="selectedCategory = category"
        :class="['category-button', { selected: selectedCategory === category }]"
      >
        {{ category }}
      </button>
    </div>
    <div class="products-list">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card">
        <img :src="product.image" :alt="product.name">
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="description">{{ product.description }}</p>
          <p class="price">${{ product.price }}</p>
          <button @click="addToCart(product)" class="add-to-cart" :disabled="isAdding">
            {{ isAdding ? 'Adding...' : 'Add to Cart' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 장바구니 추가 성공 모달 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>✅ Added to Cart!</h3>
          <button @click="closeModal" class="close-button">&times;</button>
        </div>
        <div class="modal-body" v-if="addedProduct">
          <div class="product-summary">
            <img :src="addedProduct.image" :alt="addedProduct.name" class="modal-product-image">
            <div class="product-details">
              <h4>{{ addedProduct.name }}</h4>
              <p class="modal-price">${{ addedProduct.price }}</p>
              <p class="quantity-info">Quantity: 1</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="continue-shopping-btn">Continue Shopping</button>
          <router-link to="/cart" class="view-cart-btn">View Cart</router-link>
        </div>
      </div>
    </div>

    <!-- 에러 모달 -->
    <div v-if="showErrorModal" class="modal-overlay" @click="closeErrorModal">
      <div class="modal-content error-modal" @click.stop>
        <div class="modal-header">
          <h3>❌ Error</h3>
          <button @click="closeErrorModal" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <p>{{ errorMessage }}</p>
        </div>
        <div class="modal-footer">
          <button @click="closeErrorModal" class="continue-shopping-btn">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import logger from '../utils/logger'

const selectedCategory = ref('All')
const products = ref([])
const categories = ref([])
const showModal = ref(false)
const showErrorModal = ref(false)
const addedProduct = ref(null)
const errorMessage = ref('')
const isAdding = ref(false)

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'All') return products.value
  return products.value.filter(product => product.category === selectedCategory.value)
})

const loadProducts = async () => {
  try {
    const response = await fetch('/api/products')
    const data = await response.json()
    products.value = data
    // 카테고리 목록 추출
    const uniqueCategories = Array.from(new Set(data.map(p => p.category)))
    categories.value = uniqueCategories
    logger.info('Products loaded', { count: products.value.length })
  } catch (error) {
    logger.error('Error loading products', error)
    alert('Failed to load products')
  }
}

const addToCart = async (product) => {
  try {
    isAdding.value = true
    let sessionId = localStorage.getItem('cartSessionId')
    if (!sessionId) {
      // Create new cart if session doesn't exist
      const response = await fetch('/api/cart', {
        method: 'POST'
      })
      const data = await response.json()
      sessionId = data.sessionId
      localStorage.setItem('cartSessionId', sessionId)
    }

    // Add item to cart
    const response = await fetch(`/api/cart/${sessionId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: product.id,
        quantity: 1
      })
    })

    if (response.ok) {
      logger.info('Product added to cart', { 
        productId: product.id,
        productName: product.name,
        price: product.price
      })
      
      // 성공 모달 표시
      addedProduct.value = product
      showModal.value = true
    } else {
      throw new Error('Failed to add product to cart')
    }
  } catch (error) {
    logger.error('Error adding product to cart', error)
    errorMessage.value = 'Failed to add product to cart. Please try again.'
    showErrorModal.value = true
  } finally {
    isAdding.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  addedProduct.value = null
}

const closeErrorModal = () => {
  showErrorModal.value = false
  errorMessage.value = ''
}

onMounted(() => {
  loadProducts()
  logger.info('Products page mounted', { 
    totalProducts: products.value.length
  })
})
</script>

<style scoped>
.products-page {
  padding: 2rem;
  background: var(--color-background);
  color: var(--color-text);
  min-height: 100vh;
}

h1.title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--color-heading);
}

.category-buttons {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.category-button {
  min-width: 100px;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  border: 2px solid var(--color-button-primary);
  background: var(--color-card-background);
  color: var(--color-button-primary);
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-button.selected {
  background: var(--color-button-primary);
  color: white;
  border: 2px solid var(--color-button-primary);
}

.category-button:hover:not(.selected) {
  background: var(--color-button-secondary);
  color: var(--color-button-secondary-text);
}

.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.product-card {
  background: var(--color-card-background);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--color-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--color-border);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px var(--color-shadow);
}

.product-card img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.product-info {
  padding: 1.5rem;
}

.product-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-heading);
  font-size: 1.2rem;
}

.description {
  color: var(--color-text);
  opacity: 0.8;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.price {
  color: var(--color-heading);
  font-weight: bold;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.add-to-cart {
  width: 100%;
  padding: 0.8rem;
  background-color: var(--color-button-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-to-cart:hover {
  background-color: var(--color-button-primary-hover);
}

.add-to-cart:disabled {
  background-color: var(--color-border);
  cursor: not-allowed;
  opacity: 0.6;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: var(--color-card-background);
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px var(--color-shadow);
  animation: slideIn 0.3s ease;
  border: 1px solid var(--color-border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  color: var(--color-heading);
  font-size: 1.4rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text);
  opacity: 0.6;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.close-button:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.5rem;
}

.product-summary {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.modal-product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.product-details h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-heading);
  font-size: 1.1rem;
}

.modal-price {
  color: var(--color-button-primary);
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0.25rem 0;
}

.quantity-info {
  color: var(--color-text);
  opacity: 0.8;
  font-size: 0.9rem;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.continue-shopping-btn {
  flex: 1;
  padding: 0.8rem 1rem;
  background: var(--color-button-secondary);
  color: var(--color-button-secondary-text);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.continue-shopping-btn:hover {
  background: var(--color-button-secondary-hover);
}

.view-cart-btn {
  flex: 1;
  padding: 0.8rem 1rem;
  background: var(--color-button-primary);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-cart-btn:hover {
  background: var(--color-button-primary-hover);
}

.error-modal .modal-header h3 {
  color: var(--color-danger);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-50px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .category-button {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .product-summary {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style> 