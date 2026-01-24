const db = require('../Models/Index');
const { Op } = require('sequelize');

async function getAllMessagesForUser(userId) {
    return await db.Poruka.findAll({
        where: { [Op.or]: [{ posiljalac_id: userId }, { primalac_id: userId }] },
        include: [
            { model: db.Korisnik, as: 'Posiljalac' },
            { model: db.Korisnik, as: 'Primalac' }
        ],
        order: [['createdAt', 'DESC']]
    });
}

async function getConversationHistory(userId, receiverId) {
    return await db.Poruka.findAll({
        where: {
            [Op.or]: [
                { posiljalac_id: userId, primalac_id: receiverId },
                { posiljalac_id: receiverId, primalac_id: userId }
            ]
        },
        order: [['createdAt', 'ASC']]
    });
}

async function markMessagesAsRead(senderId, receiverId) {
    return await db.Poruka.update(
        { procitano: true },
        {
            where: {
                posiljalac_id: senderId,
                primalac_id: receiverId,
                procitano: false
            }
        }
    );
}

async function getUserById(userId) {
    return await db.Korisnik.findByPk(userId);
}

async function getUserWithInterests(userId) {
    return await db.Korisnik.findByPk(userId, {
        include: [
            { model: db.Zanrovi, as: 'InteresiZanrovi' },
            { model: db.Jezik, as: 'InteresiJezici' }
        ]
    });
}

module.exports = {
    getAllMessagesForUser,
    getConversationHistory,
    markMessagesAsRead,
    getUserById,
    getUserWithInterests
};