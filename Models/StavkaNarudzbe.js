const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/database');

const StavkaNarudzbe = sequelize.define('StavkaNarudzbe', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    narudzba_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    knjiga_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cijena_u_trenutku_kupovine: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    kolicina: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    }
}, {
    tableName: 'StavkeNarudzbe',
    timestamps: false,
});

module.exports = StavkaNarudzbe;