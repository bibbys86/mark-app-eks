<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
</script>

<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-brand">Mark Shop</div>
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/products">Products</router-link>
        <router-link to="/cart">Cart</router-link>
        <router-link to="/login">Login</router-link>
      </div>
    </nav>
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
.app {
  font-family: Arial, sans-serif;
  background: var(--color-background);
  color: var(--color-text);
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--color-card-background);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 2px 4px var(--color-shadow);
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-heading);
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links a {
  color: var(--color-text);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-links a:hover {
  background: var(--color-button-secondary);
  color: var(--color-button-primary);
}

.nav-links a.router-link-active {
  background: var(--color-button-primary);
  color: white;
}

.main-content {
  padding: 0;
  max-width: none;
  margin: 0;
}

/* 스크롤바 스타일링 (웹킷 기반 브라우저) */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-background);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-hover);
}
</style>
