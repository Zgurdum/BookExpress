// Services/reportsService.js

const reportsDao = require('../DAO/reportsDao');
const userService = require('./user_servisi');

async function getUserById(userId) {
    return await userService.getKorisnikDetails(userId);
}

async function createReport(reportData) {
    return await reportsDao.createReport(reportData);
}

module.exports = {
    getUserById,
    createReport
};