const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CartItem = sequelize.define('CartItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    associate: (models) => {
      CartItem.belongsTo(models.Cart, {
        foreignKey: 'cartId'
      });
      CartItem.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'Product'
      });
    }
  });

  return CartItem;
}; 