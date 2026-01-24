const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/database');

const Obavijest = sequelize.define('Obavijest', {
        korisnik_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        narudzba_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        poruka: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        tip: {
            type: DataTypes.STRING, // 'kupac_prihvaceno', 'prodavac_nova_narudzba'
            allowNull: false
        },
        procitano: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'Obavijesti',
        timestamps: true // Automatski će napraviti createdAt za datum obavijesti
    });

module.exports = Obavijest;