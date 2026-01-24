const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/database'); 

const Korpa = sequelize.define('Korpa', {
    stavka_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, 
    },
    // ID kupca koji dodaje u korpu
    korisnik_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // ID oglasa/knjige koja se kupuje
    knjiga_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    datum_dodavanja: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Korpa',
    timestamps: false, // Koristimo datum_dodavanja umjesto defaultnih timestamps
});

module.exports = Korpa;