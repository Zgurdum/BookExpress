const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/database'); 

const Zanrovi = sequelize.define('Zanrovi', {
    zanr_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, 
    },
    naziv: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true, // ne mogu biti dva ista zanra
    }
}, {
    tableName: 'Zanr',
    timestamps: false, 
});

module.exports = Zanrovi;