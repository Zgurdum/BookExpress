const {DataTypes, ENUM} = require('sequelize');
const {sequelize} = require('../Database/database');

const Lokacija = sequelize.define('Lokacija', {
        lokacija_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        naziv: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'Lokacije',
        timestamps: false
});

module.exports = Lokacija;