/*CREATE TABLE Korisnik (
    korisnik_id SERIAL PRIMARY KEY,
    ime VARCHAR(50) NOT NULL,
    prezime VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    lozinka_hash VARCHAR(255) NOT NULL,
    uloga VARCHAR(15) NOT NULL CHECK (uloga IN ('administrator', 'prodavac', 'kupac')), -- [cite: 10, 11, 12, 17, 18, 19]
    status VARCHAR(15) NOT NULL CHECK (status IN ('aktivan', 'neaktivan', 'blokiran', 'arhiviran')), -- [cite: 27, 53]
    datum_registracije TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    profilna_slika_url VARCHAR(255), -- [cite: 56]
    opis_prodavaca TEXT, -- [cite: 57]
    prosjecna_ocjena NUMERIC(2,1) DEFAULT 0.0, -- [cite: 60]
    blokiran_do DATE -- [cite: 26]
);
*/
const {DataTypes, ENUM} = require('sequelize');
const {sequelize} = require('../Database/database');

const Korisnik = sequelize.define('Korisnik', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,  
    },
    ime: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    prezime: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    lozinka_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    uloga: {
        type: DataTypes.ENUM('administrator', 'prodavac', 'kupac'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('aktivan', 'neaktivan', 'blokiran', 'arhiviran'),
        allowNull: false,
    },
    datum_registracije: {
        type: DataTypes.DATE, 
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    profilna_slika_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    opis_prodavaca: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    prosjecna_ocjena: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 0.0,
    },
    lokacija_id: {
            type: DataTypes.INTEGER,
            allowNull: true, 
            references: {
                model: 'Lokacije', 
                key: 'lokacija_id'
            }
    },
    blokiran_do: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: 'Korisnik',
    timestamps: false,
});

module.exports = Korisnik;