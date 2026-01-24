const cartDao = require('../DAO/cartDao');

//ako je nema u korpi pozovi dao dodaj je

async function addToCart(knjiga_id, korisnik_id) {
    const postojecaStavka = await cartDao.findItem(knjiga_id, korisnik_id);
    if (postojecaStavka) {

        throw new Error("Knjiga je vec u korpi");
    }
    return await cartDao.addToCart(knjiga_id, korisnik_id);
}

//Obrisi stavku iz carta ako ne primi oba parametra onda nece obrisati stavku, kao neki failsafe
async function removeFromCart(korisnik_id, knjiga_id) {
        if (!korisnik_id || !knjiga_id) {
            throw new Error("Nedostaju podaci za brisanje.");
        }
        
        //Dao brise iz baze
        await cartDao.removeFromCart(korisnik_id, knjiga_id);
}

async function getAllItems(korisnik_id) {
    return await cartDao.getAllItems(korisnik_id);
}

module.exports = {
    addToCart,
    removeFromCart,
    getAllItems
};