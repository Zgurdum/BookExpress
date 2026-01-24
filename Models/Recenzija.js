const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/database');

const Recenzija = sequelize.define('Recenzija', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    kupac_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Korisnik koji ostavlja recenziju'
    },
    prodavac_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Korisnik koji prima recenziju (prodavac)'
    },
    narudzba_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'Veza sa narudžbom - osigurava da se recenzija može ostaviti samo jednom po kupovini'
    },
    ocjena: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    komentar: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    datum_recenzije: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Recenzije',
    timestamps: false, // Koristimo datum_recenzije umjesto createdAt/updatedAt
});

module.exports = Recenzija;