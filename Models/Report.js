const { DataTypes } = require('sequelize');
const {sequelize} = require('../Database/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reporterId: { // ID onoga ko šalje prijavu
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reportedId: { // ID korisnika koji je prijavljen
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
});

module.exports = Report;