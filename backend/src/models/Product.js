const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    image: {
      type: DataTypes.STRING
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    associate: (models) => {
      Product.hasMany(models.CartItem, { 
        foreignKey: 'productId', 
        as: 'CartItems' 
      });
    }
  });

  return Product;
}; 