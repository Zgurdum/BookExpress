const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/database'); 

const Jezik = sequelize.define('Jezik', {
    jezik_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, 
    },
    naziv: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    }
}, {
    tableName: 'Jezik',
    timestamps: false,
});


module.exports = Jezik;