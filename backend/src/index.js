// Initialize Datadog APM tracer first
const tracer = require('dd-trace').init({
  service: process.env.DD_SERVICE || 'mark-shop-backend',
  env: process.env.DD_ENV || 'mark-shop',
  version: process.env.DD_VERSION || '1.0.0',
  logInjection: true
});

const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware - RUM과 APM 연결을 위한 CORS 설정
app.use(cors({
  origin: '*',
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    // Datadog RUM-APM 연결을 위한 tracing headers
    'x-datadog-trace-id',
    'x-datadog-parent-id', 
    'x-datadog-origin',
    'x-datadog-sampling-priority',
    'traceparent',
    'tracestate',
    'b3',
    'X-B3-TraceId',
    'X-B3-SpanId',
    'X-B3-Sampled'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Custom Morgan format for JSON logging
morgan.token('custom-json', (req, res) => {
  return JSON.stringify({
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: res.responseTime,
    userAgent: req.get('user-agent'),
    referer: req.get('referer')
  });
});

app.use(morgan(':custom-json', { 
  stream: logger.stream,
  skip: (req) => req.url === '/health' // Skip health check logs
}));

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/mark_shop', {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg)
});

// Import models
const Product = require('./models/Product')(sequelize);
const Cart = require('./models/Cart')(sequelize);
const CartItem = require('./models/CartItem')(sequelize);
const Order = require('./models/Order')(sequelize);
const OrderItem = require('./models/OrderItem')(sequelize);

// Initialize model associations
const models = {
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem
};

Object.values(models).forEach(model => {
  if (model.associate) {
    logger.debug('Initializing associations for model', { modelName: model.name });
    model.associate(models);
  }
});

// Define associations
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'CartItems' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'CartItems' });

// Order and OrderItem associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'OrderItems' });

// Initialize database and start server
async function initializeDatabase() {
  try {
    // Sync database with force to reset all data
    await sequelize.sync({ force: true })
    logger.info('Database synced with force')

    // Seed products
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone',
        price: 999.00,
        category: 'iPhone',
        image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'iPad Pro',
        description: 'Powerful iPad',
        price: 799.00,
        category: 'iPad',
        image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'MacBook Air',
        description: 'Lightweight laptop',
        price: 1199.00,
        category: 'Mac',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Apple Watch',
        description: 'Smart watch',
        price: 399.00,
        category: 'Watch',
        image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'AirPods Pro',
        description: 'Wireless earbuds',
        price: 249.00,
        category: 'AirPods',
        image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'iPhone 15',
        description: 'Affordable iPhone',
        price: 799.00,
        category: 'iPhone',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'iPad Air',
        description: 'Lightweight iPad',
        price: 599.00,
        category: 'iPad',
        image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'MacBook Pro',
        description: 'High performance laptop',
        price: 1999.00,
        category: 'Mac',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Apple Watch SE',
        description: 'Affordable smart watch',
        price: 279.00,
        category: 'Watch',
        image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'AirPods Max',
        description: 'Premium over-ear headphones',
        price: 549.00,
        category: 'AirPods',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
      }
    ]

    await Product.bulkCreate(products)
    logger.info('Products seeded')

    // Create default cart for testing
    await Cart.create({
      sessionId: '8c85c569-a597-4a15-9436-32e7270ed42c'
    })
    logger.info('Default cart created')
  } catch (error) {
    logger.error('Error initializing database', error)
    throw error
  }
}

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
});

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', { error: error.message });
  }
}

testConnection();

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip
  });
  next();
});

// Routes
app.get('/', (req, res) => {
  logger.info('Home route accessed');
  res.json({ message: 'Welcome to Mark Shop API' });
});

// Cart API endpoints
app.post('/api/cart', async (req, res) => {
  try {
    const sessionId = uuidv4();
    const cart = await Cart.create({ sessionId });
    logger.info('Cart created', { cartId: cart.id, sessionId });
    res.json({ cartId: cart.id, sessionId });
  } catch (error) {
    logger.error('Error creating cart', error);
    res.status(500).json({ error: 'Failed to create cart' });
  }
});

app.get('/api/cart/:sessionId', async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { sessionId: req.params.sessionId },
      include: [{
        model: CartItem,
        as: 'CartItems',
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['id', 'name', 'price', 'image', 'description']
        }]
      }]
    });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    logger.error('Error fetching cart', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.post('/api/cart/:sessionId/items', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productId, quantity } = req.body;

    // Find or create cart
    let cart = await Cart.findOne({ where: { sessionId } });
    if (!cart) {
      cart = await Cart.create({ sessionId });
    }

    // Find existing cart item
    let cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId: productId
      }
    });

    if (cartItem) {
      // Update existing item quantity
      cartItem.quantity = quantity;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId: productId,
        quantity: quantity
      });
    }

    // Return updated cart
    const updatedCart = await Cart.findOne({
      where: { sessionId },
      include: [{
        model: CartItem,
        as: 'CartItems',
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['id', 'name', 'price', 'image', 'description']
        }]
      }]
    });

    res.json(updatedCart);
  } catch (error) {
    logger.error('Error adding item to cart', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

app.delete('/api/cart/:sessionId/items/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { sessionId: req.params.sessionId } });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    await CartItem.destroy({
      where: { cartId: cart.id, productId: req.params.productId }
    });

    logger.info('Cart item removed', { 
      cartId: cart.id, 
      productId: req.params.productId 
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    logger.error('Error removing item from cart', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Products API endpoint
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    logger.info('Products retrieved', { count: products.length });
    res.json(products);
  } catch (error) {
    logger.error('Error retrieving products', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// Checkout endpoint
app.post('/api/checkout', async (req, res) => {
  try {
    const { sessionId, shippingAddress, paymentMethod } = req.body;

    // Get cart and items
    const cart = await Cart.findOne({
      where: { sessionId },
      include: [{
        model: CartItem,
        as: 'CartItems',
        include: [{
          model: Product,
          as: 'Product'
        }]
      }]
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = cart.CartItems.reduce((total, item) => {
      return total + (item.Product.price * item.quantity);
    }, 0);

    // Create order
    const order = await Order.create({
      sessionId,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Create order items
    await Promise.all(cart.CartItems.map(item => 
      OrderItem.create({
        orderId: order.id,
        productId: item.Product.id,
        quantity: item.quantity,
        price: item.Product.price
      })
    ));

    // Clear cart
    await CartItem.destroy({
      where: { cartId: cart.id }
    });

    logger.info('Order created', { 
      orderId: order.id,
      totalAmount,
      itemCount: cart.CartItems.length
    });

    res.json({
      orderId: order.id,
      totalAmount,
      status: order.status
    });
  } catch (error) {
    logger.error('Error creating order', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order details
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    logger.info('Fetching order details', { orderId: req.params.orderId });
    
    const order = await Order.findOne({
      where: { id: req.params.orderId },
      include: [{
        model: OrderItem,
        as: 'OrderItems',
        include: [{
          model: Product,
          as: 'Product'
        }]
      }]
    });

    if (!order) {
      logger.warn('Order not found', { orderId: req.params.orderId });
      return res.status(404).json({ error: 'Order not found' });
    }

    logger.info('Order retrieved successfully', { 
      orderId: order.id, 
      itemCount: order.OrderItems ? order.OrderItems.length : 0 
    });
    res.json(order);
  } catch (error) {
    logger.error('Error retrieving order', error);
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Internal Server Error' });
}); 