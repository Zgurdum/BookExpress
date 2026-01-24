const { DataTypes, ENUM } = require('sequelize');
const { sequelize } = require('../Database/database');

const Narudzba = sequelize.define('Narudzba', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    kupac_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ukupna_cijena: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    status: {
        type: ENUM('na_cekanju', 'prihvacena', 'dostavljeno', 'odbijena'),
        allowNull: false,
        defaultValue: 'na_cekanju',
    },
    adresa_dostave: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    broj_telefona: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    datum_narudzbe: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'Narudzbe',
    timestamps: false,
});

module.exports = Narudzba;