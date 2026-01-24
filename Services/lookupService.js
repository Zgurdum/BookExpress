// Services/lookupService.js

const lookupDao = require('../DAO/lookupDao');

async function getAllLocations() {
    return await lookupDao.getAllLocations();
}

async function getAllGenres() {
    return await lookupDao.getAllGenres();
}

async function getAllLanguages() {
    return await lookupDao.getAllLanguages();
}

async function getAllLookupData() {
    const [locations, genres, languages] = await Promise.all([
        getAllLocations(),
        getAllGenres(),
        getAllLanguages()
    ]);

    return {
        locations,
        genres,
        languages
    };
}

module.exports = {
    getAllLocations,
    getAllGenres,
    getAllLanguages,
    getAllLookupData
};