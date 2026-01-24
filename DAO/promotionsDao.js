const db = require('../Models/Index');

async function createPromotionRecord(data) {
    return await db.Promotions.create({
        knjiga_id: data.bookId,
        korisnik_id: data.userId,
        iznos: data.amount,
        status: 'aktivan',
        datum_promocije: new Date(),
        transaction_id: data.transactionId
    });
}

async function getPromotionByBookId(bookId) {
    return await db.Promotions.findOne({
        where: {
            knjiga_id: bookId,
            status: 'aktivan'
        },
        order: [['datum_promocije', 'DESC']]
    });
}

async function getUserPromotions(userId) {
    return await db.Promotions.findAll({
        where: { korisnik_id: userId },
        include: [{
            model: db.Knjige,
            as: 'Knjiga'
        }],
        order: [['datum_promocije', 'DESC']]
    });
}

async function deactivatePromotion(bookId) {
    return await db.Promotions.update(
        { status: 'neaktivan' },
        { where: { knjiga_id: bookId, status: 'aktivan' } }
    );
}

async function getActivePromotions() {
    return await db.Promotions.findAll({
        where: { status: 'aktivan' },
        include: [{
            model: db.Knjige,
            as: 'Knjiga',
            where: { status_knjige: 'aktivna' },
            required: true 
        }]
    });
}

module.exports = {
    createPromotionRecord,
    getPromotionByBookId,
    getUserPromotions,
    deactivatePromotion,
    getActivePromotions
};