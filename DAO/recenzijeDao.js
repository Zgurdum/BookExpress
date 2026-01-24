const db = require('../Models/Index');

async function createReview(data) {
    return await db.Recenzija.create({
        ocjena: data.ocjena,
        komentar: data.komentar,
        narudzba_id: data.narudzba_id,
        kupac_id: data.kupac_id,
        prodavac_id: data.prodavac_id
    });
}

// Provjera da li je već ostavljena recenzija za tu narudžbu
async function provjeriDaLiJeOcjenjeno(narudzbaId) {
    return await db.Recenzija.findOne({ where: { narudzba_id: narudzbaId } });
}
async function getSveRecenzijeZaProfil(prodavacId) {
    return await db.Recenzija.findAll({
        where: { prodavac_id: prodavacId },
        include: [{ 
            model: db.Korisnik, 
            as: 'KupacRecenzent', // alias iz index.js
            attributes: ['ime', 'prezime'] 
        }],
        order: [['datum_recenzije', 'DESC']]
    });
}

async function getStatistikaRecenzija(prodavacId) {
    const stats = await db.Recenzija.findOne({
        where: { prodavac_id: prodavacId },
        attributes: [
            [db.sequelize.fn('AVG', db.sequelize.col('ocjena')), 'prosjek'],
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'ukupno']
        ],
        raw: true
    });

    // Osiguraj da se vrati broj ili 0, a ne null ili string
    return {
        prosjek: stats.prosjek ? parseFloat(stats.prosjek).toFixed(1) : null,
        ukupno: parseInt(stats.ukupno) || 0
    };

}

async function getRecenzijeByKupac (kupacId) {
    return await db.Recenzija.findAll({
        where: { kupac_id: kupacId },
        include: [
            { model: db.Korisnik, as: 'KupacRecenzent', attributes: ['ime', 'prezime'] },
            { model: db.Korisnik, as: 'OcijenjeniProdavac', attributes: ['ime', 'prezime'] }
        ],
        order: [['datum_recenzije', 'DESC']]
    });
};

async function getById (id) {
    return await db.Recenzija.findByPk(id);
};

async function update(id, data) {
    return await db.Recenzija.update(data, { where: { id } });
};
module.exports = { createReview, 
    provjeriDaLiJeOcjenjeno,
    getStatistikaRecenzija,
    getRecenzijeByKupac,
    getById,
    update,
    getSveRecenzijeZaProfil
};