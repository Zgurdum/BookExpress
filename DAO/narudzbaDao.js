const db = require('../Models/Index');
const Narudzba = db.Narudzba;
const StavkaNarudzbe = db.StavkaNarudzbe;
const Korpa = db.Korpa;

async function createOrderFromCart(narudzbaData, stavkeIzKorpe, korisnik_id) {
    // Transakcija je ovdje korisna jer radimo vise operacija na vise tabela, ako jedna operacija propadne, nece se nijedna izvrsit
    const t = await db.sequelize.transaction();

    try {
        // novi zapis u narudzabama
        const novaNarudzba = await Narudzba.create(narudzbaData, { transaction: t });

        // pretvaramo stavke iz korpe u stavke narudzbe
        const stavkeZaUnos = stavkeIzKorpe.map(stavka => ({
            narudzba_id: novaNarudzba.id,
            knjiga_id: stavka.knjiga_id,
            cijena_u_trenutku_kupovine: stavka.Knjiga.cijena, 
            kolicina: 1 
        }));

        // Upisi sve u narudzbu
        await StavkaNarudzbe.bulkCreate(stavkeZaUnos, { transaction: t });

        // Sve iz korpe obrisi
        //Da je prethodna operacija pala a ova prosla, bezveze bi obrisali sve iz korpe 
        await Korpa.destroy({
            where: { korisnik_id: korisnik_id },
            transaction: t
        });

        // Ako je sve proslo ok, commit gurne promjene
        await t.commit();
        return novaNarudzba;

    } catch (error) {
        // Ako padne rollback ponisti sve
        await t.rollback();
        console.error("Greška u NarudzbaDAO (Transakcija):", error);
        throw error;
    }
}

async function getUserOrders(korisnik_id) {
    return await Narudzba.findAll({
        where: { kupac_id: korisnik_id },
        include: [{
            model: StavkaNarudzbe,
            as: 'Stavke',
            include: [{
                model: db.Knjige,
                as: 'Knjiga',
                paranoid: false // da bi mogao citati i one knjige sto su u soft delete modu otisle
            }]
        }],
        order: [['id', 'DESC']] // Prvo idu nove narudzbe
    });
}


async function getOrderItemsWithBooks(narudzbaId, transaction) {
    return await StavkaNarudzbe.findAll({
        where: { narudzba_id: narudzbaId },
        include: [{ model: db.Knjige, as: 'Knjiga' }],
        transaction
    });
}

async function promjeniStatusNarudzbe(narudzbaId, noviStatus, transaction){
    return await Narudzba.update(
        { status: noviStatus},
        {where: {id: narudzbaId}, transaction}
    )
}

async function getObavijestiZaProdavca(prodavacId) {
    return await db.StavkaNarudzbe.findAll({
        include: [
            {
                model: db.Knjige,
                as: 'Knjiga',
                where: { prodavac_id: prodavacId }, // Samo njegove knjige
                required: true
            },
            {
                model: db.Narudzba,
                as: 'GlavnaNarudzba',
                where: { status: 'na_cekanju' }, // Samo nove narudžbe
                include: [{ model: db.Korisnik, as: 'Kupac', attributes: ['ime', 'prezime'] }]
            }
        ]
    });
}

async function getOrderWithItems(orderId) {
    return await Narudzba.findByPk(orderId, {
        include: [{
            model: StavkaNarudzbe, as: 'Stavke',
            include: [{ model: db.Knjige, as: 'Knjiga' }]
        }]
    });
}

async function getOrderById(orderId, transaction = null) {
    return await Narudzba.findByPk(orderId, { transaction });
}

module.exports = {
    createOrderFromCart,
    getUserOrders,
    promjeniStatusNarudzbe,
    getObavijestiZaProdavca,
    getOrderItemsWithBooks,
    getOrderWithItems,
    getOrderById
};