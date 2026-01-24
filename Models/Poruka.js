const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/database');

const Poruka = sequelize.define('Poruka', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    posiljalac_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Korisnik',
            key: 'id'
        }
    },
    primalac_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Korisnik',
            key: 'id'
        }
    },
    tekst: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    procitano: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    dostavljeno: {
        type: DataTypes.BOOLEAN,
        defaultValue: true // Since it's real-time chat, messages are delivered immediately
    }
}, {
    tableName: 'poruka',
    timestamps: true // Ovo kreira createdAt (vrijeme slanja) i updatedAt automatski
});

module.exports = Poruka;