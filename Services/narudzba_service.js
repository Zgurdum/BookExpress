const db = require('../Models/Index'); // Uvoz centralnog indexa
const narudzbaDAO = require('../DAO/narudzbaDao');
const korpaDAO = require('../DAO/cartDao');
const knjigaDAO = require('../DAO/knjigaDao');
const obavijestiDAO = require('../DAO/obavijestiDao');
const { sequelize } = require('../Models/Index');

async function getCartItemsForCheckout(korisnik_id) {
    return await korpaDAO.getAllItems(korisnik_id);
}

async function getUserOrders(korisnik_id) {
    return await narudzbaDAO.getUserOrders(korisnik_id);
}

async function getObavijestiZaProdavca(korisnikId) {
    return await narudzbaDAO.getObavijestiZaProdavca(korisnikId);
}

async function getUnreadNotificationsForUser(korisnikId) {
    return await obavijestiDAO.getUnreadNotificationsForUser(korisnikId);
}

async function markNotificationAsRead(id) {
    return await obavijestiDAO.markNotificationAsRead(id);
}

async function procesuirajCheckout(korisnik_id, infoZaDostavu) {
    try {
        //UZImamo sve stavke iz korpe
        const stavkeUKorpi = await korpaDAO.getAllItems(korisnik_id);

        //Provjera je li ima stavki u korpi
        if (!stavkeUKorpi || stavkeUKorpi.length === 0) {
            throw new Error("Korpa je prazna, ne možete izvršiti narudžbu.");
        }

        //Sumiranje iznosa
        const ukupnaSuma = stavkeUKorpi.reduce((sum, stavka) => {
            return sum + parseFloat(stavka.Knjiga.cijena);
        }, 0);

        // Ovo cemo proslijediti kupcu knjige
        const narudzbaData = {
            kupac_id: korisnik_id,
            ukupna_cijena: ukupnaSuma,
            adresa_dostave: infoZaDostavu.adresa,
            broj_telefona: infoZaDostavu.telefon,
            status: 'na_cekanju'
        };

        //Sve sto je bilo u korpi sada saljemo DAO modelu da napravi narudzbu u tabeli narudzbe
        const novaNarudzba = await narudzbaDAO.createOrderFromCart(
            narudzbaData, 
            stavkeUKorpi, 
            korisnik_id
        );
        return novaNarudzba;

    } catch (error) {
        console.error("Greška u narudzba_servici:", error.message);
        throw error;
    }
}

async function obradiZahtjevProdavca(narudzbaId, prodavacId, akcija) {
    const t = await sequelize.transaction();
    try {
        // Nadji tu narudzbu 
        const narudzba = await narudzbaDAO.getOrderById(narudzbaId, t);
        if (!narudzba) throw new Error("Narudžba nije pronađena");

        let noviStatus;
        let porukaZaKupca = "";
        let tipObavijesti = "";
        //Ako korisnik hoce da prihvati smjestamo ove podatke u varijable i redom svaku stavku iz narudbe prebacujemo u arhivirano stanje
        if (akcija === 'prihvati') {
            noviStatus = 'prihvacena';
            tipObavijesti = 'kupac_prihvaceno';
            porukaZaKupca = `Prodavac je prihvatio vašu narudžbu #${narudzba.id}. Sada možete ocijeniti prodavca.`;

            const stavke = await narudzbaDAO.getOrderItemsWithBooks(narudzbaId, t);

            for (const stavka of stavke) {
                if (stavka.Knjiga.prodavac_id === parseInt(prodavacId)) {
                    await knjigaDAO.archiveBookStatus(stavka.knjiga_id, t);
                }
            }
        } else if (akcija === 'odbij') {
            noviStatus = 'odbijena';
            tipObavijesti = 'kupac_odbijeno';
            porukaZaKupca = `Nažalost, prodavac je odbio vašu narudžbu #${narudzba.id}.`;
        } else {
            throw new Error("Nevalidna akcija");
        }

        // novi status narudzbe
        await narudzbaDAO.promjeniStatusNarudzbe(narudzba.id, noviStatus, t);

        // 3. Kad se desi promjena pravimo i obavijest
        await obavijestiDAO.createNotificationWithTransaction({
            korisnik_id: narudzba.kupac_id, // Šaljemo kupcu
            narudzba_id: narudzba.id,
            poruka: porukaZaKupca,
            tip: tipObavijesti
        }, t);

        await t.commit();
        return { success: true, status: noviStatus };
    } catch (error) {
        await t.rollback();
        console.error("Greška u obradi zahtjeva:", error.message);
        throw error;
    }
}

module.exports = {
    procesuirajCheckout,
    obradiZahtjevProdavca,
    getCartItemsForCheckout,
    getUserOrders,
    getObavijestiZaProdavca,
    getUnreadNotificationsForUser,
    markNotificationAsRead
};