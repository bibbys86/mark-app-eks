const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true  // 비로그인 사용자도 카트 사용 가능
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    associate: (models) => {
      Cart.hasMany(models.CartItem, {
        foreignKey: 'cartId',
        as: 'CartItems'
      });
    }
  });

  return Cart;
}; 