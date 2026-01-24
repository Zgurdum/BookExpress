const cartDao = require('../DAO/cartDao');

async function dodajUKorpu(knjigaId, korisnikId) {
    // Provjera: da li je knjiga već u korpi za ovog korisnika?
    const postojecaStavka = await cartDao.pronadjiStavku(knjigaId, korisnikId);
    
    if (postojecaStavka) {
        throw new Error("Ova knjiga se već nalazi u vašoj korpi.");
    }

    // Ako nije, dodajemo je
    return await cartDao.kreirajStavku(knjigaId, korisnikId);
}

module.exports = { dodajUKorpu };