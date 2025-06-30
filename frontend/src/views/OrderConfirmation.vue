<template>
  <div class="order-confirmation">
    <div v-if="loading" class="loading">
      Loading order details...
    </div>
    
    <div v-else-if="error" class="error">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <router-link to="/" class="btn">Return to Home</router-link>
    </div>
    
    <div v-else class="confirmation-content">
      <div class="success-message">
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order has been received.</p>
      </div>

      <div class="order-details">
        <h2>Order Details</h2>
        <div class="detail-row">
          <span>Order Number:</span>
          <span>{{ order.id }}</span>
        </div>
        <div class="detail-row">
          <span>Order Status:</span>
          <span class="status">{{ order.status }}</span>
        </div>
        <div class="detail-row">
          <span>Payment Status:</span>
          <span class="status">{{ order.paymentStatus }}</span>
        </div>
        <div class="detail-row">
          <span>Total Amount:</span>
          <span>${{ order.totalAmount }}</span>
        </div>
      </div>

      <div class="shipping-info">
        <h2>Shipping Information</h2>
        <div class="address-details">
          <p>{{ order.shippingAddress.name }}</p>
          <p>{{ order.shippingAddress.address }}</p>
          <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zip }}</p>
        </div>
      </div>

      <div class="order-items">
        <h2>Order Items</h2>
        <div class="items-list">
          <div v-for="item in order.OrderItems" :key="item.id" class="order-item">
            <img :src="item.Product.image" :alt="item.Product.name" class="item-image">
            <div class="item-details">
              <h3>{{ item.Product.name }}</h3>
              <p class="quantity">Quantity: {{ item.quantity }}</p>
              <p class="price">${{ item.price }} each</p>
            </div>
            <div class="item-total">
              ${{ (item.price * item.quantity).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <router-link to="/products" class="btn">Continue Shopping</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderConfirmation',
  data() {
    return {
      order: null,
      loading: true,
      error: null
    }
  },
  methods: {
    async loadOrder() {
      try {
        const orderId = this.$route.params.orderId;
        console.log('Loading order with ID:', orderId);
        
        const response = await fetch(`/api/orders/${orderId}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('API Error:', errorData);
          throw new Error('Failed to load order details');
        }
        
        this.order = await response.json();
        console.log('Order loaded:', this.order);
      } catch (error) {
        console.error('Error loading order:', error);
        this.error = 'Failed to load order details. Please try again later.';
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.loadOrder();
  }
}
</script>

<style scoped>
.order-confirmation {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: var(--color-background);
  color: var(--color-text);
  min-height: 100vh;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: var(--color-text);
}

.error h2 {
  color: var(--color-danger);
}

.confirmation-content {
  background: var(--color-card-background);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px var(--color-shadow);
  border: 1px solid var(--color-border);
}

.success-message {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.success-message h1 {
  color: var(--color-success);
  margin-bottom: 10px;
}

.success-message p {
  color: var(--color-text);
}

.order-details, .shipping-info, .order-items {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.order-details h2, .shipping-info h2, .order-items h2 {
  color: var(--color-heading);
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  color: var(--color-text);
}

.detail-row span:first-child {
  font-weight: 500;
}

.status {
  text-transform: capitalize;
  font-weight: 500;
  color: var(--color-button-primary);
}

.address-details p {
  margin: 5px 0;
  color: var(--color-text);
}

.order-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  padding: 15px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
  border-radius: 8px;
  margin-bottom: 10px;
}

.order-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details h3 {
  margin: 0 0 5px 0;
  color: var(--color-heading);
}

.quantity {
  color: var(--color-text);
  opacity: 0.8;
  margin: 5px 0;
}

.price {
  color: var(--color-text);
  opacity: 0.8;
}

.item-total {
  font-weight: bold;
  font-size: 1.1em;
  color: var(--color-heading);
}

.actions {
  text-align: center;
  margin-top: 30px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  background: var(--color-button-primary);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--color-shadow);
}

.btn:hover {
  background: var(--color-button-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow);
}

@media (max-width: 768px) {
  .order-item {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .item-image {
    margin: 0 auto;
  }

  .item-total {
    text-align: center;
  }
}
</style> 