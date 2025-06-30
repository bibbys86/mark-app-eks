<template>
  <div class="cart-container">
    <h1>Shopping Cart</h1>
    
    <div v-if="loading" class="loading">
      Loading cart...
    </div>
    
    <div v-else-if="!cart || !cart.CartItems || cart.CartItems.length === 0" class="empty-cart">
      <p>Your cart is empty</p>
      <router-link to="/products" class="btn">Continue Shopping</router-link>
    </div>
    
    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cart.CartItems" :key="item.id" class="cart-item">
          <img v-if="item.Product && item.Product.image" :src="item.Product.image" :alt="item.Product.name" class="item-image">
          <div class="item-details">
            <h3>{{ item.Product ? item.Product.name : 'Unknown Product' }}</h3>
            <p class="price">${{ item.Product ? item.Product.price : '0.00' }}</p>
            <div class="quantity-controls">
              <button @click="decreaseQuantity(item.Product ? item.Product.id : null, item.quantity)" :disabled="item.quantity <= 1 || updating">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="increaseQuantity(item.Product ? item.Product.id : null, item.quantity)" :disabled="updating">+</button>
            </div>
          </div>
          <button @click="removeItem(item.Product ? item.Product.id : null)" class="remove-btn">Remove</button>
        </div>
      </div>

      <div class="cart-summary">
        <h2>Order Summary</h2>
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${{ subtotal }}</span>
        </div>
        <div class="summary-row">
          <span>Shipping:</span>
          <span>${{ shipping }}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>${{ total }}</span>
        </div>

        <form @submit.prevent="checkout" class="checkout-form">
          <h3>Shipping Information</h3>
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" v-model="shippingInfo.name" required>
          </div>
          <div class="form-group">
            <label for="address">Address</label>
            <input type="text" id="address" v-model="shippingInfo.address" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="city">City</label>
              <input type="text" id="city" v-model="shippingInfo.city" required>
            </div>
            <div class="form-group">
              <label for="state">State</label>
              <input type="text" id="state" v-model="shippingInfo.state" required>
            </div>
            <div class="form-group">
              <label for="zip">ZIP Code</label>
              <input type="text" id="zip" v-model="shippingInfo.zip" required>
            </div>
          </div>

          <h3>Payment Method</h3>
          <div class="form-group">
            <select v-model="paymentMethod" required>
              <option value="">Select Payment Method</option>
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <button type="submit" class="checkout-btn" :disabled="checkingOut">
            {{ checkingOut ? 'Processing...' : 'Proceed to Checkout' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Cart',
  data() {
    return {
      cart: null,
      loading: true,
      checkingOut: false,
      updating: false, // 수량 업데이트 중인지 표시
      error: null, // 에러 메시지
      shippingInfo: {
        name: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      },
      paymentMethod: '',
      shipping: 5.99 // Fixed shipping cost
    }
  },
  computed: {
    subtotal() {
      if (!this.cart || !this.cart.CartItems) return 0;
      return this.cart.CartItems.reduce((total, item) => {
        return total + (item.Product ? item.Product.price * item.quantity : 0);
      }, 0);
    },
    total() {
      return this.subtotal + this.shipping;
    }
  },
  methods: {
    async loadCart() {
      try {
        const sessionId = localStorage.getItem('cartSessionId');
        if (!sessionId) {
          this.cart = null;
          this.error = 'No cart session found';
          this.loading = false;
          return;
        }

        console.log('Loading cart with sessionId:', sessionId);
        const response = await fetch(`/api/cart/${sessionId}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        console.log('Cart response status:', response.status);
        if (!response.ok) {
          throw new Error('Failed to load cart');
        }
        
        const data = await response.json();
        console.log('Cart data:', data);
        
        if (!data || !data.CartItems || data.CartItems.length === 0) {
          this.cart = null; // 빈 카트일 때 cart를 null로 설정
          this.error = 'Your cart is empty';
        } else {
          this.cart = data;
          this.error = null; // 성공적으로 로드되면 에러 클리어
        }
        this.loading = false;
      } catch (error) {
        console.error('Error loading cart:', error);
        this.error = 'Failed to load cart. Please try again.';
        this.loading = false;
      }
    },
    async updateQuantity(productId, newQuantity) {
      if (newQuantity < 1) return;
      
      try {
        this.updating = true;
        const sessionId = localStorage.getItem('cartSessionId');
        const response = await fetch(`/api/cart/${sessionId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId,
            quantity: newQuantity
          })
        });

        if (!response.ok) throw new Error('Failed to update quantity');
        
        await this.loadCart();
      } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Failed to update quantity. Please try again.');
      } finally {
        this.updating = false;
      }
    },
    async increaseQuantity(productId, currentQuantity) {
      await this.updateQuantity(productId, currentQuantity + 1);
    },
    async decreaseQuantity(productId, currentQuantity) {
      if (currentQuantity > 1) {
        await this.updateQuantity(productId, currentQuantity - 1);
      }
    },
    async removeItem(productId) {
      try {
        const sessionId = localStorage.getItem('cartSessionId');
        const response = await fetch(
          `/api/cart/${sessionId}/items/${productId}`,
          { method: 'DELETE' }
        );

        if (!response.ok) throw new Error('Failed to remove item');
        
        await this.loadCart();
      } catch (error) {
        console.error('Error removing item:', error);
        alert('Failed to remove item. Please try again.');
      }
    },
    async checkout() {
      if (this.checkingOut) return;
      
      try {
        this.checkingOut = true;
        const sessionId = localStorage.getItem('cartSessionId');
        
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId,
            shippingAddress: this.shippingInfo,
            paymentMethod: this.paymentMethod
          })
        });

        if (!response.ok) throw new Error('Failed to process checkout');
        
        const order = await response.json();
        localStorage.removeItem('cartSessionId'); // Clear cart session
        
        // Redirect to order confirmation
        this.$router.push(`/order-confirmation/${order.orderId}`);
      } catch (error) {
        console.error('Error during checkout:', error);
        alert('Failed to process checkout. Please try again.');
      } finally {
        this.checkingOut = false;
      }
    }
  },
  created() {
    this.loadCart();
  }
}
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: var(--color-background);
  color: var(--color-text);
  min-height: 100vh;
}

.loading, .empty-cart {
  text-align: center;
  padding: 40px;
  color: var(--color-text);
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.cart-items {
  background: var(--color-card-background);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px var(--color-shadow);
  border: 1px solid var(--color-border);
}

.cart-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-details h3 {
  color: var(--color-heading);
  margin: 0;
}

.item-details .price {
  color: var(--color-button-primary);
  font-weight: bold;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-controls button {
  width: 30px;
  height: 30px;
  border: 1px solid var(--color-border);
  background: var(--color-card-background);
  color: var(--color-text);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quantity-controls button:hover:not(:disabled) {
  background: var(--color-button-secondary);
}

.quantity-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-controls span {
  color: var(--color-text);
  font-weight: 500;
}

.remove-btn {
  padding: 8px 16px;
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.remove-btn:hover {
  opacity: 0.9;
}

.cart-summary {
  background: var(--color-card-background);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px var(--color-shadow);
  border: 1px solid var(--color-border);
}

.cart-summary h2 {
  color: var(--color-heading);
  margin: 0 0 1rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  color: var(--color-text);
}

.summary-row.total {
  font-size: 1.2em;
  font-weight: bold;
  border-top: 2px solid var(--color-border);
  padding-top: 10px;
  margin-top: 10px;
  color: var(--color-heading);
}

.checkout-form {
  margin-top: 20px;
}

.checkout-form h3 {
  color: var(--color-heading);
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--color-text);
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-input-background);
  color: var(--color-text);
  transition: border-color 0.2s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--color-button-primary);
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  background: var(--color-success);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1em;
  cursor: pointer;
  margin-top: 20px;
  transition: opacity 0.2s ease;
}

.checkout-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.checkout-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style> 