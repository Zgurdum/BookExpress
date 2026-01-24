const { DataTypes } = require('sequelize');
const { sequelize } = require('../Database/database'); 

const StanjeKnjige = sequelize.define('StanjeKnjige', {
    stanje_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, 
    },
    naziv_stanja: { //'novo', 'polovno', 'oštećeno'
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    }
}, {
    tableName: 'StanjeKnjige',
    timestamps: false,
});


module.exports = StanjeKnjige;