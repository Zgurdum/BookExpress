const narudzbaService = require('../Services/narudzba_service');


exports.potvrdiNarudzbu = async (req, res) => {
    try {
        const korisnikId = req.session.user.id;
        const { adresa, telefon } = req.body;
        
        //Proslijedi servisu zahtjev
        const narudzba = await narudzbaService.procesuirajCheckout(korisnikId, { adresa, telefon });

        res.redirect(`/orders/narudzbe/${narudzba.id}?success=true`)
    } catch (err) {
        console.error("Greška na checkoutu:", err);
        res.status(500).send("Došlo je do greške pri kreiranju narudžbe.");
    }
};

exports.renderCheckoutPage = async (req, res) => {
    try {
        //Uzima sve stavke iz korpe nakon sto korisnik klikne zavrsi narudzbu
        const korisnik_id = req.session.user.id;
        const stavke = await narudzbaService.getCartItemsForCheckout(korisnik_id);
        console.log(stavke);
        if (stavke.length === 0) {
            return res.redirect('/cart?info=empty');
        }

        let ukupno = stavke.reduce((sum, s) => sum + parseFloat(s.Knjiga.cijena), 0);

        res.render('narudzba', { 
            stavke, 
            ukupno,
            user: req.session.user
        });
    } catch (err) {
        res.status(500).send("Greška pri učitavanju: " + err.message);
    }
};

exports.showOrderDetails = async (req, res) => {
    try {
        const narudzbaId = req.params.id;
        const korisnik_id = req.session.user.id;

        const narudzbe = await narudzbaService.getUserOrders(korisnik_id);
        
        // iz narudzbi nalazimo tacno tu narudzbu
        const narudzba = narudzbe.find(n => n.id == narudzbaId);

        if (!narudzba) {
            return res.status(404).send("Narudžba nije pronađena.");
        }

        res.render('potvrdaNarudzbe', { 
            narudzba, 
            success: req.query.success, // Prosljedjujem success poruku ako postoji
            user: req.session.user 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Greška pri prikazu potvrde narudžbe.");
    }
};

exports.showAllOrders = async (req, res) => {
    try {
        const korisnik_id = req.session.user.id;
        
        const narudzbe = await narudzbaService.getUserOrders(korisnik_id);

        res.render('mojeNarudzbe', { 
            narudzbe, 
            user: req.session.user 
        });
    } catch (err) {
        console.error("Greška pri dohvatu narudžbi:", err);
        res.status(500).send("Greška na serveru.");
    }
};

exports.getObavijesti = async (req, res) => {
    try {
        const korisnikId = (req.session && req.session.user) ? req.session.user.id : (req.user ? req.user.id : null);
        
        if (!korisnikId) {
            return res.status(401).json({ error: "Niste prijavljeni." });
        }

        // Narudzbe koje cekaju potvrdu ili odbijanje
        const obavijestiProdavac = await narudzbaService.getObavijestiZaProdavca(korisnikId);

        //Narudzbe koje su prihvacene ili odbijene idu korisniku kupcu
        const obavijestiKupac = await narudzbaService.getUnreadNotificationsForUser(korisnikId);

        // ovo saljem u objektu zajedno
        res.json({
            zahtjeviZaProdaju: obavijestiProdavac, 
            potvrdeKupovine: obavijestiKupac
        });

    } catch (error) {
        console.error("Greška u kontroleru obavijesti:", error);
        res.status(500).json({ error: error.message });
    }
};



exports.odgovoriNaNarudzbu = async (req, res) => {
    try {
        const { narudzbaId, akcija } = req.body; // akcija: 'prihvati' ili 'odbij'
        const prodavacId = req.session.user.id; // onaj ulogovani

        const rezultat = await narudzbaService.obradiZahtjevProdavca(narudzbaId, prodavacId, akcija);

        res.status(200).json(rezultat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//u sustini samo je obrise iz prikaza
exports.oznaciObavijestProcitanom = async (req, res) => {
    try {
        const { id } = req.params;
        await narudzbaService.markNotificationAsRead(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};