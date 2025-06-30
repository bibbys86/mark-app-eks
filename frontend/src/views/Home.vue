<template>
  <div class="home">
    <div class="hero-section">
      <h1>Welcome to Apple Store</h1>
      <p class="subtitle">Think Different. Think Apple.</p>
    </div>
    
    <div class="intro-section">
      <h2>About Apple</h2>
      <p>Apple Inc. is an American multinational technology company that designs, develops, and sells consumer electronics, computer software, and online services. Founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976, Apple has been at the forefront of innovation in personal technology.</p>
    </div>

    <div class="features">
      <div class="feature-card">
        <h3>Innovation</h3>
        <p>Pioneering new technologies and setting industry standards</p>
      </div>
      <div class="feature-card">
        <h3>Design</h3>
        <p>Beautiful, intuitive, and user-friendly products</p>
      </div>
      <div class="feature-card">
        <h3>Quality</h3>
        <p>Premium materials and exceptional craftsmanship</p>
      </div>
    </div>

    <div class="cta-section">
      <router-link to="/products" class="cta-button">Explore Our Products</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import logger from '../utils/logger'

onMounted(() => {
  logger.info('Home page mounted')
})
</script>

<style scoped>
.home {
  text-align: center;
  padding: 2rem;
  background: var(--color-background);
  color: var(--color-text);
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 6rem 2rem;
  margin: -2rem -2rem 2rem -2rem;
  border-radius: 0 0 20px 20px;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.intro-section {
  max-width: 800px;
  margin: 0 auto 4rem auto;
  padding: 0 1rem;
}

.intro-section h2 {
  color: var(--color-heading);
  margin-bottom: 1.5rem;
}

.intro-section p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
  padding: 0 1rem;
}

.feature-card {
  background: var(--color-card-background);
  padding: 2rem;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 8px var(--color-shadow);
  border: 1px solid var(--color-border);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px var(--color-shadow);
}

.feature-card h3 {
  color: var(--color-heading);
  margin-bottom: 1rem;
}

.feature-card p {
  color: var(--color-text);
}

.cta-section {
  margin: 4rem 0;
}

.cta-button {
  display: inline-block;
  background-color: var(--color-button-primary);
  color: white;
  padding: 1rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px var(--color-shadow);
}

.cta-button:hover {
  background-color: var(--color-button-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--color-shadow);
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
  }
  
  .features {
    grid-template-columns: 1fr;
  }
}
</style> 