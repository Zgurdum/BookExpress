const recenzijaDao = require('../DAO/recenzijeDao');
const narudzbaDao = require('../DAO/narudzbaDao');

async function getOrderWithItems(narudzba_id) {
    return await narudzbaDao.getOrderWithItems(narudzba_id);
}

async function checkIfAlreadyReviewed(narudzba_id) {
    return await recenzijaDao.provjeriDaLiJeOcjenjeno(narudzba_id);
}

async function createReview(reviewData) {
    return await recenzijaDao.createReview(reviewData);
}

async function getReviewById(id) {
    return await recenzijaDao.getById(id);
}

async function getPodatkeZaProfil(prodavacId) {
    const [statistika, lista] = await Promise.all([
        recenzijaDao.getStatistikaRecenzija(prodavacId),
        recenzijaDao.getSveRecenzijeZaProfil(prodavacId)
    ]);

    return {
        lista,
        prosjek: statistika.prosjek ? parseFloat(statistika.prosjek).toFixed(1) : "Nema ocjena",
        ukupno: statistika.ukupno || 0
    };
}

async function prepareUserReviews (korisnikId) {
    const rezultati = await recenzijaDao.getRecenzijeByKupac(korisnikId);
    const sad = new Date();

    return rezultati.map(r => {
        const rec = r.toJSON();
        const d = new Date(rec.datum_recenzije);
        
        const razlikaUHorima = (sad - d) / (1000 * 60 * 60);
        
        return {
            ...rec,
            mozeUrediti: razlikaUHorima < 24 && razlikaUHorima >= 0,
            preostaloSati: Math.max(0, Math.floor(24 - razlikaUHorima)),
            datum_za_prikaz: d.toLocaleString('hr-HR')
        };
    });
};

async function editReview (id, kupacId, novaOcjena, noviKomentar) {
    const recenzija = await recenzijaDao.getById(id);

    if (!recenzija) throw new Error("Recenzija nije pronađena.");
    if (recenzija.kupac_id !== kupacId) throw new Error("Neovlašten pristup.");

    // Provjera poslovne logike
    const razlikaUHorima = (new Date() - new Date(recenzija.datum_recenzije)) / (1000 * 60 * 60);
    if (razlikaUHorima > 24) throw new Error("Vrijeme za izmjenu je isteklo.");

    return await recenzijaDao.update(id, { ocjena: novaOcjena, komentar: noviKomentar });
};
module.exports = { 
    getPodatkeZaProfil,
    prepareUserReviews,
    editReview,
    getOrderWithItems,
    checkIfAlreadyReviewed,
    createReview,
    getReviewById
 };