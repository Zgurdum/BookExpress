const db = require('../Models/Index');
const Korpa = db.Korpa;

async function findItem(knjiga_id, korisnik_id) {
    return await Korpa.findOne({
        where: {
            knjiga_id: knjiga_id,
            korisnik_id: korisnik_id
        }
    });
}

async function addToCart(knjiga_id, korisnik_id) {
    return await Korpa.create({
        knjiga_id: knjiga_id,
        korisnik_id: korisnik_id
    });
}

async function getAllItems(korisnik_id) { //jer kad promijenimo rutu kart se isprazni, na svaki redirect moramo ponovo dohvatiti stavke
    const rawStavke = await db.Korpa.findAll({
            where: { korisnik_id: korisnik_id },
            include: [{
                model: db.Knjige, // Mora biti model Knjige iz Index.js
                as: 'Knjiga'      // Alias mora biti isti kao u Index.js (belongsTo)
            }],
            raw: true,  // Vraća obične objekte umjesto Sequelize instance
            subQuery: false
    });
    
    // Transformiraj dot-notation (raw: true) u nested struktura za konzistentnost
    return rawStavke.map((stavka) => {
        return {
            stavka_id: stavka.stavka_id,
            knjiga_id: stavka.knjiga_id,
            korisnik_id: stavka.korisnik_id,
            datum_dodavanja: stavka.datum_dodavanja,
            Knjiga: {
                id: stavka['Knjiga.id'],
                prodavac_id: stavka['Knjiga.prodavac_id'],
                naziv: stavka['Knjiga.naziv'],
                autor: stavka['Knjiga.autor'],
                izdavac: stavka['Knjiga.izdavac'],
                godina_izdanja: stavka['Knjiga.godina_izdanja'],
                zanr_id: stavka['Knjiga.zanr_id'],
                jezik_id: stavka['Knjiga.jezik_id'],
                opis: stavka['Knjiga.opis'],
                stanje_id: stavka['Knjiga.stanje_id'],
                cijena: stavka['Knjiga.cijena'],
                mogucnost_razmjene: stavka['Knjiga.mogucnost_razmjene'],
                status_knjige: stavka['Knjiga.status_knjige'],
                fotografija_url: stavka['Knjiga.fotografija_url'],
                pregledi: stavka['Knjiga.pregledi'],
                datum_dodavanja: stavka['Knjiga.datum_dodavanja']
            }
        };
    });
}

async function removeFromCart(korisnik_id, knjiga_id) {
    return await Korpa.destroy({
        where: {
            korisnik_id: korisnik_id,
            knjiga_id: knjiga_id
        }
    });
}

module.exports = {
    findItem,
    addToCart,
    getAllItems,
    removeFromCart
};
