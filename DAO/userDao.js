const Korisnik = require("../Models/Korisnik");
const db = require('../Models/Index');

async function getKorisnikById(id) {
    return Korisnik.findByPk(id, {
            //ne vracaj pw na rutama gdje nije potreban
        attributes: { exclude: ['lozinka'] } 
    });
}

async function getKorisnikWithInterests(userId) {
    return await Korisnik.findByPk(userId, {
        include: [
            { model: db.Zanrovi, as: 'InteresiZanrovi' },
            { model: db.Jezik, as: 'InteresiJezici' }
        ]
    });
}

async function getKorisnikInstance(userId) {
    return await Korisnik.findByPk(userId);
}

async function getByEmail(email) {
    return Korisnik.findOne({ where: { email } }); 
}

async function createKorisnik(userData) {
    return Korisnik.create(userData); 
}

async function updateKorisnik(userId, updateData) {
    try {
        // data je: ime, prezime. zanrovi.. jeztici..
        const [updatedCount] = await Korisnik.update(updateData, {
            where: {
                id: userId
            }
        });

        if (updatedCount === 0) {
            return null
        }
        return await Korisnik.findByPk(userId);

    } catch (error) {
        console.error('DAO Greška pri ažuriranju korisnika:', error);
        throw new Error("Database query failed while updating user profile.");
    }
}


module.exports = {
    getKorisnikById,
    getByEmail,
    createKorisnik,
    updateKorisnik,
    getKorisnikWithInterests,
    getKorisnikInstance
};