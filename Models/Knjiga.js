/*CREATE TABLE Knjiga (
    knjiga_id SERIAL PRIMARY KEY,
    prodavac_id INTEGER NOT NULL REFERENCES Korisnik(korisnik_id), -- [cite: 11]
    naziv VARCHAR(255) NOT NULL, -- [cite: 63]
    autor VARCHAR(100) NOT NULL, -- [cite: 64]
    izdavac VARCHAR(100), -- [cite: 65]
    godina_izdanja INTEGER, -- [cite: 66]
    zanr_id INTEGER NOT NULL REFERENCES Zanr(zanr_id), -- [cite: 67]
    jezik_id INTEGER NOT NULL REFERENCES Jezik(jezik_id), -- [cite: 68]
    opis TEXT, -- [cite: 69]
    stanje_id INTEGER NOT NULL REFERENCES StanjeKnjige(stanje_id), -- [cite: 70]
    cijena NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- [cite: 71]
    mogucnost_razmjene BOOLEAN NOT NULL DEFAULT FALSE, -- [cite: 72, 124]
    status_knjige VARCHAR(20) NOT NULL CHECK (status_knjige IN ('aktivna', 'rezervisana', 'prodana/razmijenjena', 'arhivirana')), -- [cite: 75, 76, 77, 78, 79]
    fotografija_url VARCHAR(255), -- [cite: 74]
    datum_dodavanja TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
*/
const {DataTypes, ENUM} = require('sequelize');
const {sequelize} = require('../Database/database');

const Knjige = sequelize.define('Knjige', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,  
    },
    prodavac_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    naziv: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    autor: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    izdavac: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    godina_izdanja: {
        type: DataTypes.INTEGER, 
        allowNull: true,

    },
    zanr_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    jezik_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    opis: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    stanje_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cijena: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    mogucnost_razmjene: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    status_knjige: {
        type: ENUM('aktivna', 'rezervisana', 'prodana/razmijenjena', 'arhivirana'),
        allowNull: false,
    },
    fotografija_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pregledi: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
    },
    datum_dodavanja: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'Knjiga',
    timestamps: true,
    paranoid: true,
    createdAt: 'datum_dodavanja',
    updatedAt: false, //Omogucavam soft delete na taj nacin zapravo ne brisem knjigu iz tabele vec samo postavljam kolonu deletedAt na vrijednost true, poslije filtriram po njoj
});



module.exports = Knjige;