
const db = require('../Models/Index');
const Knjiga = db.Knjige;
const Korisnik = db.Korisnik;
const Zanrovi = db.Zanrovi;
const Jezik = db.Jezik;
const StanjeKnjige = db.StanjeKnjige;
// sequalize instans
const { sequelize } = require('../Database/database'); 
const { create } = require('./userDao');
const Op = db.Sequelize.Op;


async function get18RandomActiveBooks() {
    try {
        // kupi samo aktivne
        const books = await Knjiga.findAll({
            where: {
                status_knjige: 'aktivna'
            },
            // Ovo je logika za nasumično sortiranje i ograničenje na 18
            order: [
                sequelize.literal('RANDOM()') // svaki oput drugacije
            ],
            limit: 18
        });
        //lista je
        return books;
    } catch (error) {
        console.error('DAO Error fetching random active books:', error);
        throw new Error("Database query failed while fetching random books.");
    }
}

async function getMoreRandomActiveBooks(offset = 0) {
    try {
        // Ponovo ista funkcija, jer prva se poziva ucitavanjem rute a ova klikom
        const books = await Knjiga.findAll({
            where: {
                status_knjige: 'aktivna'
            },
            // Ovo je logika za nasumično sortiranje i ograničenje na 18
            order: [
                sequelize.literal('RANDOM()') // svaki oput drugacije
            ],
            limit: 18,
            offset: offset
        });
        //lista je
        return books;
    } catch (error) {
        console.error('DAO Error fetching more random active books:', error);
        throw new Error("Database query failed while fetching more random books.");
    }
}

async function get6PopularBooks(){
console.log("[DAO]: Dohvatanje 6 najpopularnijih knjiga.");
    try {
        const popularBooks = await Knjiga.findAll({

            where: {
                status_knjige: 'aktivna'
            },
            order: [['pregledi', 'DESC']],
            limit: 6
        });

        return popularBooks;
    } catch (error) {
        console.error('DAO Greška pri dohvatu popularnih knjiga:', error);
        throw new Error("Neuspješno dohvatanje popularnih knjiga iz baze.");
    }
  
}
async function getSuggestions(zanrIds, jezikIds, userId = null) {
    try {
        console.log("DAO INPUT -> Žanrovi:", zanrIds, "Jezici:", jezikIds, "User:", userId);

        const whereClause = {
            status_knjige: 'aktivna'
        };

        const orConditions = [];

        // Zanrovi
        if (zanrIds && zanrIds.length > 0) {
            orConditions.push({ zanr_id: { [Op.in]: zanrIds } });
        }

        // Jezici
        if (jezikIds && jezikIds.length > 0) {
            orConditions.push({ jezik_id: { [Op.in]: jezikIds } });
        }


        if (orConditions.length > 0) {
            whereClause[Op.or] = orConditions;
        }

        //Knjige koje su od trenutnog korisnika nece biti prikazane
        if (userId) {
            whereClause.prodavac_id = { [Op.ne]: userId };
        }

        console.log("WHERE CLAUSE objekat:", JSON.stringify(whereClause, null, 2));

        let results = await Knjiga.findAll({
            where: whereClause,
            limit: 8,
            include: [{ model: Zanrovi, as: 'Zanr' }],
            order: [sequelize.literal('RANDOM()')], // Da svaki put vidi druge preporuke
            logging: console.log 
        });

        // Ako nema zanrova ili jeziaka ili ako nema tih knjiga sa tim zanrovima jezicima onda nemoj nista prikazat
        if (results.length === 0) {
            console.log("!!! REZULTAT JE 0 - Pokrećem totalni fallback !!!");
            results = await Knjiga.findAll({
                where: { 
                    status_knjige: 'aktivna',
                    ...(userId && { prodavac_id: { [Op.ne]: userId } })
                },
                limit: 8,
                include: [{ model: Zanrovi, as: 'Zanr' }],
                order: [sequelize.literal('RAND()')]
            });
        }

        console.log("Konačan broj knjiga za slanje:", results.length);
        return results;

    } catch (error) {
        console.error("KRITIČNA GREŠKA U DAO:", error);
        return [];
    }
}

//vraca najpopularnije
async function getMostPopular() {
    try {
        const books = await Knjiga.findAll({
            where: {
                status_knjige: 'aktivna'
            },
            order: [
                ['pregledi', 'DESC']
            ],
            // prvih 6
            limit: 6
        });

        return books;
    } catch (error) {
        console.error("Greška pri dohvatu popularnih knjiga:", error);
        throw error;
    }
}

async function createKnjiga(newBookData){
console.log("DAO: Pokušaj kreiranja nove knjige u bazi");
    try {
        const novaKnjiga = await Knjiga.create(newBookData);
        console.log('DAO: Zapis uspješno kreiran, vraćeni ID:', novaKnjiga.id);
        const userId = newBookData.prodavac_id;
        if (userId) {
            const korisnik = await Korisnik.findByPk(userId);
            
            // AKO JE TRENUTNO KUPAC PREBACI GA NA PRODAVAC - LOGIKA za kupac/prodavac
            if (korisnik && korisnik.uloga === 'kupac') {
                await korisnik.update({ uloga: 'prodavac' });
                console.log(`DAO: Korisnik ID ${userId} automatski unaprijeđen u 'prodavac'`);
            }
        }


        return novaKnjiga;
    } catch (error) {
        console.error('GREŠKA pri kreiranju knjige:', error);
        throw new Error("Neuspješno snimanje knjige u bazu.");
    }
}
async function getBookDetailsById(knjigaId) {
    console.log(`[DAO]: Pokušaj dohvata detalja za knjigu ID: ${knjigaId} (sa svim asocijacijama).`);
    try {
        //Kad korisnik udje na id knjige poveca se pregled za 1
        await Knjiga.increment('pregledi', { 
            by: 1, 
            where: { id: knjigaId } 
        });
        const book = await Knjiga.findByPk(knjigaId, {
            // Sve asocijacije neophodne
            include: [
                {
                    model: Korisnik,
                    as: 'Prodavac', 
                    attributes: ['id', 'ime', 'prezime', 'email', 'opis_prodavaca'] 
                },
                {
                    model: Zanrovi,
                    as: 'Zanr', 
                    attributes: ['naziv']
                },
                {
                    model: Jezik,
                    as: 'Jezik', 
                    attributes: ['naziv']
                },
                {
                    model: StanjeKnjige,
                    as: 'Stanje', 
                    attributes: ['naziv_stanja']
                }
            ],

        });

        if (book) {
            const rawDate = book.datum_dodavanja || book.createdAt;

            if (rawDate) {
                const dateObj = new Date(rawDate);
                // format za europski datum i precisnots
                const formatted = dateObj.toLocaleDateString('bs-BA', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                
                book.setDataValue('datum_dodavanja_formatirano', formatted);
            } else {
                book.setDataValue('datum_dodavanja_formatirano', 'N/A');
            }
        }

        return book;

    } catch (error) {
        console.error('DAO Greška pri dohvatu detalja knjige:', error);
        throw new Error("Database query failed while fetching book details.");
    }
}
async function getAllZanrovi() {
    return await Zanrovi.findAll({ attributes: ['zanr_id', 'naziv'], order: [['naziv', 'ASC']] });
}

async function getAllJezici() {
    return await Jezik.findAll({ attributes: ['jezik_id', 'naziv'], order: [['naziv', 'ASC']] });
}

async function getAllStanja() {
    return await StanjeKnjige.findAll({ attributes: ['stanje_id', 'naziv_stanja'] });
}
async function deleteKnjiga(knjigaId, userId) { 
    // Moze bez ovog ali prikaz naziva 
    const knjiga = await Knjiga.findByPk(knjigaId);
    if (!knjiga) return null; 

    const deletedCount = await Knjiga.destroy({
        where: {
            id: knjigaId,
            prodavac_id: userId // Da li je njegovo?
        }
    });

    if (deletedCount > 0) {
        return { deletedCount, knjigaNaziv: knjiga.naziv };
    }
    return null; 
}

async function updateKnjiga(knjigaId, userId, updateData) {
    try {
        // Broj promijenjih redova
        const [updatedCount] = await Knjiga.update(updateData, {
            where: {
                id: knjigaId,
                prodavac_id: userId // Je  li owner?
            }
        });

        if (updatedCount === 0) {
            return null; 
        }
        return await Knjiga.findByPk(knjigaId);

    } catch (error) {
        console.error('DAO Greška pri ažuriranju knjige:', error);
        throw new Error("Database query failed while updating book.");
    }
}

async function getKnjigeByUserId(userId) {
    return await Knjiga.findAll({
        where: {
            prodavac_id: userId,
            status_knjige: 'aktivna' // Prikazujem samo aktivne oglase
        },
        order: [['datum_dodavanja', 'DESC']]

    });
}

//pretraživanje knjiga prema nazivu ili autoru
async function searchKnjige(filters) {
    try {
        console.log("[DAO] Pretraga pokrenuta za:", filters.q);
        
        const { q, zanr, jezik, minCijena, maxCijena, sort } = filters;
        let whereClause = { [Op.and]: [
            {status_knjige: 'aktivna'} //DA NE BI VRATILA ARhIVIRANU
        ] };

        // Tekstualna pretraga
        if (q) {
            whereClause[Op.and].push({
                [Op.or]: [
                    { naziv: { [Op.iLike]: `%${q}%` } },
                    { autor: { [Op.iLike]: `%${q}%` } }
                ]
            });
        }

        // Filteri (koristimo nazive kolona iz baze)
        if (zanr) whereClause[Op.and].push({ zanr_id: zanr });
        if (jezik) whereClause[Op.and].push({ jezik_id: jezik });

        // Raspon cijena
        if (minCijena || maxCijena) {
            let cijenaFilter = {};
            if (minCijena) cijenaFilter[Op.gte] = parseFloat(minCijena);
            if (maxCijena) cijenaFilter[Op.lte] = parseFloat(maxCijena);
            whereClause[Op.and].push({ cijena: cijenaFilter });
        }

        // Čišćenje where klauzule ako je prazna
        if (whereClause[Op.and].length === 0) whereClause = {};

        // Sortiranje
        let orderClause = [['id', 'DESC']]; // Podrazumijevano
        if (sort === 'jeftinije') orderClause = [['cijena', 'ASC']];
        if (sort === 'skuplje') orderClause = [['cijena', 'DESC']];

        // IZVRŠAVANJE
        const rezultati = await Knjiga.findAll({
            where: whereClause,
            order: orderClause,
            include: [
                { model: Zanrovi, as: 'Zanr', attributes: ['naziv'] },
                { model: Jezik, as: 'Jezik', attributes: ['naziv'] }
            ]
        });

        console.log("[DAO] Rezultati pronađeni:", rezultati.length);
        return rezultati;

    } catch (error) {
        console.error("[DAO ERROR]:", error);
        throw error;
    }
}

//Stavlja status u arhivirano koristim poslije da filtriram prodane neprodane
async function archiveBookStatus(bookId, transaction) {
    return await db.Knjige.update(
        { status_knjige: 'arhivirana' }, // Kolona i novi status
        { where: { id: bookId }, transaction }
    );
}


//Sluzi da vrati arhivirane knjige na frontend dijelu profila korisnika zavrseni oglasi
async function getArhiviraneKnjigePoKorisniku(korisnikId) {
    try {
        return await db.Knjige.findAll({
            where: {
                prodavac_id: korisnikId,
                status_knjige: 'arhivirana'
            },
            order: [['datum_dodavanja', 'DESC']] // Prikazuje zadnje prodate prve
        });
    } catch (error) {
        console.error("Greška pri dohvatu završenih oglasa:", error);
        throw error;
    }
}

module.exports = {
    get18RandomActiveBooks,
    getMoreRandomActiveBooks,
    createKnjiga,
    getBookDetailsById,
    getAllZanrovi,
    getAllJezici,
    getAllStanja,
    deleteKnjiga,
    updateKnjiga,
    getKnjigeByUserId,
    searchKnjige,
    getMostPopular,
    get6PopularBooks,
    archiveBookStatus,
    getArhiviraneKnjigePoKorisniku,
    getSuggestions

};