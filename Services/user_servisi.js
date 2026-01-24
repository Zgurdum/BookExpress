const path = require('path');
const fs = require('fs');
const UserDao = require('../DAO/userDao');
const db = require('../Models/Index');

async function getKorisnikDetails(userId) {
    return await UserDao.getKorisnikById(userId);
}
async function getKorisnikForProfileEdit(userId) {
    
    const user = await UserDao.getKorisnikWithInterests(userId);
    
    if (!user) {
        throw new Error("Korisnik nije pronađen");
    }

    return user;
}

async function getUserWithInterests(userId) {
    // Koristim DAO za dohvat korisnika sa interesima za preporuke
    const user = await UserDao.getKorisnikWithInterests(userId);
    
    if (!user) {
        return null;
    }

    // Mapiramo u nizove ID-ova jer to DAO ocekuje
    const zanrIds = user.InteresiZanrovi ? user.InteresiZanrovi.map(z => z.zanr_id) : [];
    const jezikIds = user.InteresiJezici ? user.InteresiJezici.map(j => j.jezik_id) : [];

    return {
        ...user.get({ plain: true }),
        zanrIds,
        jezikIds
    };
}
async function editUserProfile(userId, rawFormBody, file) {

    const user = await UserDao.getKorisnikInstance(userId);
    if (!user) throw new Error("Korisnik nije pronađen.");

    // Priprema odataka za tabelu 'Korisnici'
    const updateData = {
        ime: rawFormBody.ime,
        prezime: rawFormBody.prezime,
        lokacija_id: rawFormBody.lokacija_id ? parseInt(rawFormBody.lokacija_id) : null
    };

    if (file) {
        if (user.profilna_slika_url && !user.profilna_slika_url.includes('default')) {
            const staraSlikaPutanja = path.join(__dirname, '..', 'public', user.profilna_slika_url);
            if (fs.existsSync(staraSlikaPutanja)) {
                fs.unlinkSync(staraSlikaPutanja); 
            }
        }
        updateData.profilna_slika_url = `/uploads/profili/${file.filename}`;
    }


    //osnovni podaci korisnika
    await user.update(updateData);

    //interesi jezici
    if (rawFormBody.zanrovi_ids) {
        await user.setInteresiZanrovi(rawFormBody.zanrovi_ids);
    }
    
    if (rawFormBody.jezici_ids) {
        await user.setInteresiJezici(rawFormBody.jezici_ids);
    }

    return await UserDao.getKorisnikWithInterests(userId);
}
module.exports = {
    getKorisnikDetails,
    editUserProfile,
    getKorisnikForProfileEdit,
    getUserWithInterests
};