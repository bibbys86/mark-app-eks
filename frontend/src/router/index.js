import { createRouter, createWebHistory } from 'vue-router'
import Cart from '../views/Cart.vue'
import OrderConfirmation from '../views/OrderConfirmation.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/Products.vue')
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetail.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/order-confirmation/:orderId',
    name: 'OrderConfirmation',
    component: OrderConfirmation
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 