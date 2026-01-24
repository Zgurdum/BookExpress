const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/database');

const ArhiviranaKnjiga = sequelize.define('ArhiviranaKnjiga', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    }, // Note: We keep the same ID from the original table
    prodavac_id: { type: DataTypes.INTEGER, allowNull: false },
    naziv: { type: DataTypes.STRING, allowNull: false },
    autor: { type: DataTypes.STRING, allowNull: false },
    izdavac: { type: DataTypes.STRING },
    godina_izdanja: { type: DataTypes.INTEGER },
    zanr_id: { type: DataTypes.INTEGER, allowNull: false },
    jezik_id: { type: DataTypes.INTEGER, allowNull: false },
    opis: { type: DataTypes.TEXT },
    stanje_id: { type: DataTypes.INTEGER, allowNull: false },
    cijena: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    fotografija_url: { type: DataTypes.STRING },
    datum_dodavanja: { type: DataTypes.DATE },
    datum_arhiviranja: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    }
}, {
    tableName: 'ArhiviranaKnjiga',
    timestamps: false,
});

module.exports = ArhiviranaKnjiga;