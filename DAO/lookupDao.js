const db = require('../Models/Index');

async function getAllLocations() {
    return await db.Lokacija.findAll({ order: [['naziv', 'ASC']] });
}

async function getAllGenres() {
    return await db.Zanrovi.findAll({ order: [['naziv', 'ASC']] });
}

async function getAllLanguages() {
    return await db.Jezik.findAll({ order: [['naziv', 'ASC']] });
}

module.exports = {
    getAllLocations,
    getAllGenres,
    getAllLanguages
};