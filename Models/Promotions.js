const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/database');

const Promotions = sequelize.define('Promotions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    knjiga_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    korisnik_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    iznos: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('aktivan', 'neaktivan'),
        defaultValue: 'aktivan',
        allowNull: false
    },
    datum_promocije: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'Promotions',
    timestamps: true
});

module.exports = Promotions;