const AdminDao = require('../DAO/adminDao');

async function getAdminDashboardData() {
    const stats = await AdminDao.getStats();
    
    // Prosjek knjiga po prodavacu
    const prosjekPoProdavacu = stats.korisnici.prodavaci > 0 
        ? (stats.knjige.ukupno / stats.korisnici.prodavaci).toFixed(2) 
        : 0;

    return {
        stats,
        prosjekPoProdavacu
    };
}
async function fetchUsersList(){
    return await AdminDao.getAllUsers();
};

//promjena statusa korisnika
async function changeStatus (userId, status){
    const validStatuses = ['aktivan', 'neaktivan', 'blokiran', 'arhiviran'];
    if (!validStatuses.includes(status)) throw new Error("Nevalidan status");
    
    return await AdminDao.updateUserStatus(userId, status);
};

//Blokiranje korisnika od logina
async function processBlocking (userId, type){
    let untilDate = null;
    
    if (type === '15_days') {
        untilDate = new Date();
        untilDate.setDate(untilDate.getDate() + 15);
    }
    // Ako je type 'permanent', untilDate ostaje null znaci vjecni blok
    
    return await AdminDao.blockUser(userId, untilDate);
};


async function archiveAccount  (userId)  {
    return await AdminDao.archiveUser(userId);
};

//Prikazl lookupa
async function getDashboardData() {
    const [zanrovi, jezici, lokacije, stanja] = await Promise.all([
        AdminDao.getAllFromTable('Zanrovi'),
        AdminDao.getAllFromTable('Jezik'),
        AdminDao.getAllFromTable('Lokacija'),
        AdminDao.getAllFromTable('StanjeKnjige')
    ]);
    return { zanrovi, jezici, lokacije, stanja };
}

async function fetchReports() {
    return await AdminDao.fetchReports();
}

async function createLookupItem(tip, naziv) {
    return await AdminDao.createLookupItem(tip, naziv);
}

async function deleteLookupItem(tip, id) {
    return await AdminDao.deleteLookupItem(tip, id);
}

async function updateLookupItem(tip, id, noviNaziv) {
    return await AdminDao.updateLookupItem(tip, id, noviNaziv);
}

module.exports = { 
    getAdminDashboardData,
    fetchUsersList,
    changeStatus,
    processBlocking,
    archiveAccount,
    getDashboardData,
    fetchReports,
    createLookupItem,
    deleteLookupItem,
    updateLookupItem
};