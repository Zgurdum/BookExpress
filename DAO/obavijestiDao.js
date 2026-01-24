const db = require('../Models/Index');

async function getUnreadNotificationsForUser(userId) {
    return await db.Obavijesti.findAll({
        where: {
            korisnik_id: userId,
            procitano: false //ili ti ga obrisano
        },
        include: [{
            model: db.Narudzba,
            as: 'PovezanaNarudzba'
        }],
        order: [['createdAt', 'DESC']]
    });
}

async function markNotificationAsRead(notificationId) {
    return await db.Obavijesti.update(
        { procitano: true },
        { where: { id: notificationId } }
    );
}

async function createNotification(data) {
    return await db.Obavijesti.create({
        korisnik_id: data.korisnik_id,
        narudzba_id: data.narudzba_id,
        poruka: data.poruka,
        tip: data.tip,
        procitano: false
    });
}

async function createNotificationWithTransaction(data, transaction) {
    return await db.Obavijesti.create({
        korisnik_id: data.korisnik_id,
        narudzba_id: data.narudzba_id,
        poruka: data.poruka,
        tip: data.tip,
        procitano: false
    }, { transaction });
}

async function markNotificationAsRead(notificationId) {
    return await db.Obavijesti.update(
        { procitano: true },
        { where: { id: notificationId } }
    );
}

async function deleteNotification(notificationId) {
    return await db.Obavijesti.destroy({
        where: { id: notificationId }
    });
}

module.exports = {
    getUnreadNotificationsForUser,
    markNotificationAsRead,
    createNotification,
    createNotificationWithTransaction,
    deleteNotification
};