const db = require('../Models/Index');

async function getUserById(userId) {
    return await db.Korisnik.findByPk(userId);
}

async function createReport(reportData) {
    return await db.Report.create(reportData);
}

module.exports = {
    getUserById,
    createReport
};