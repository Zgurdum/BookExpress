const db = require('../Models/Index');
const Knjiga = db.Knjige;
const Korisnik = db.Korisnik;
const Narudzba = db.Narudzba;
const Zanrovi = db.Zanrovi;
const Jezik = db.Jezik;
const StanjeKnjige = db.StanjeKnjige;

//bez ovako napravljenih varijabli nije radilo, al besmisleno je ovako. mora moci nekako samo db.

const { sequelize } = require('../Database/database'); 
const { create } = require('./userDao');

async function getStats() {
    try {
        const [
            ukupnoKorisnika, 
            prodavaci, 
            kupci, 
            ukupnoKnjiga, 
            aktivniOglasi, 
            zavrsenoNarudzbi, 
            popularniZanrovi
        ] = await Promise.all([
            Korisnik.count(),
            Korisnik.count({ where: { uloga: 'prodavac' } }),
            Korisnik.count({ where: { uloga: 'kupac' } }),
            Knjiga.count(),
            Knjiga.count({ where: { status_knjige: 'aktivna' } }),
            Narudzba ? Narudzba.count({ where: { status: 'prihvacena' } }) : 0,
            // vraca sve
            Knjiga.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('Knjige.zanr_id')), 'count']
                ],
                include: [{
                    model: Zanrovi,
                    as: 'Zanr',
                    attributes: ['naziv','naziv'] 
                }],
                group: ['Zanr.zanr_id', 'Zanr.naziv'],
                order: [[sequelize.literal('count'), 'DESC']],
                limit: 5,
                raw: true,
                nest: true
            })
        ]);

        // Izračun prosjeka (Broj knjiga / Broj prodavača)
        const prosjekPoProdavacu = prodavaci > 0 ? (ukupnoKnjiga / prodavaci).toFixed(2) : 0;

        return {
            korisnici: {
                ukupno: ukupnoKorisnika,
                prodavaci: prodavaci,
                kupci: kupci
            },
            knjige: {
                ukupno: ukupnoKnjiga,
                aktivniOglasi: aktivniOglasi,
                prosjekPoProdavacu: prosjekPoProdavacu 
            },
            narudzbe: {
                zavrseno: zavrsenoNarudzbi
            },
            popularniZanrovi: popularniZanrovi
        };
    } catch (error) {
        console.error("GREŠKA U DAO getStats:", error);
        throw error; 
    }
}

async function getAllUsers() {
    return await Korisnik.findAll({
        attributes: ['id', 'ime', 'prezime', 'email', 'uloga', 'status', 'datum_registracije']
    });
};

async function updateUserStatus (userId, newStatus) {
    return await Korisnik.update(
        { status: newStatus },
        { where: { id: userId } }
    );
};

async function blockUser (userId, untilDate = null){
    // Ako je untilDate null, to je trajni blok
    return await Korisnik.update(
        { 
            status: 'blokiran',
            blokiran_do: untilDate 
        },
        { where: { id: userId } }
    );
};

async function archiveUser (userId) {
    return await Korisnik.update(
        { status: 'arhiviran' },
        { where: { id: userId } }
    );
};

async function getAllFromTable(tableName) { //AI SKONTO DOBRU FINTU
let orderColumn = 'id'; // default
    
    if (tableName === 'Zanrovi') orderColumn = 'zanr_id';
    else if (tableName === 'Jezik') orderColumn = 'jezik_id';
    else if (tableName === 'Lokacija') orderColumn = 'lokacija_id';
    else if (tableName === 'StanjeKnjige') orderColumn = 'stanje_id';

    return await db[tableName].findAll({ 
        order: [[orderColumn, 'ASC']] 
    });
}


async function createZanr(naziv) {
    return await db.Zanrovi.create({ naziv });
}

async function updateZanr(id, naziv) {
    return await db.Zanrovi.update({ naziv }, { where: { zanr_id: id } });
}

async function deleteZanr(id, naziv) {
    return await db.Zanrovi.destroy({ where: { zanr_id: id } });
}

//reportovi
async function fetchReports() {
    return await db.Report.findAll({
        include: [
            { model: db.Korisnik, as: 'Reporter', attributes: ['ime', 'prezime'] },
            { model: db.Korisnik, as: 'PrijavljeniKorisnik', attributes: ['ime', 'prezime'] }
        ],
        order: [['createdAt', 'DESC']]
    });
}

async function updateReportStatus(reportId, status) {
    return await db.Report.update({ status }, { where: { id: reportId } });
}

async function createLookupItem(tip, naziv) {
    let model;

    switch (tip) {
        case 'zanr': model = db.Zanrovi; break;
        case 'jezik': model = db.Jezik; break;
        case 'lokacija': model = db.Lokacija; break;
        case 'stanje': model = db.StanjeKnjige; break;
        default: throw new Error("Nepoznat tip");
    }

    // AI je napravio ovu funkciju moja prethodna nije radila
    const podaci = tip === 'stanje' ? { naziv_stanja: naziv } : { naziv: naziv };

    return await model.create(podaci);
}

async function deleteLookupItem(tip, id) {
    let model, pk;

    switch (tip) {
        case 'zanr': model = db.Zanrovi; pk = 'zanr_id'; break;
        case 'jezik': model = db.Jezik; pk = 'jezik_id'; break;
        case 'lokacija': model = db.Lokacija; pk = 'lokacija_id'; break;
        case 'stanje': model = db.StanjeKnjige; pk = 'stanje_id'; break;
        default: throw new Error("Nepoznat tip");
    }

    return await model.destroy({ where: { [pk]: id } });
}

async function updateLookupItem(tip, id, noviNaziv) {
    let model, pk;

    switch (tip) {
        case 'zanr': model = db.Zanrovi; pk = 'zanr_id'; break;
        case 'jezik': model = db.Jezik; pk = 'jezik_id'; break;
        case 'lokacija': model = db.Lokacija; pk = 'lokacija_id'; break;
        case 'stanje': model = db.StanjeKnjige; pk = 'stanje_id'; break;
        default: throw new Error("Nepoznat tip");
    }

    const updateData = tip === 'stanje' ? { naziv_stanja: noviNaziv } : { naziv: noviNaziv };

    return await model.update(updateData, { where: { [pk]: id } });
}

module.exports = { 
    getStats,
    getAllUsers,
    updateUserStatus,
    blockUser,
    archiveUser,
    getAllFromTable,
    createZanr,
    updateZanr,
    deleteZanr,
    fetchReports,
    updateReportStatus,
    createLookupItem,
    deleteLookupItem,
    updateLookupItem
};