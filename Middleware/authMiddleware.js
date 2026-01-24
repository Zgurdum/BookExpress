const Knjiga = require('../Models/Knjiga');

module.exports = {
    requireLogin: (req, res, next) => {
        // Provjerava da li postoji korisnik u sesiji
        if (req.session && req.session.user) {
            // Ako je prijavljen, nastavi na sljedeći 
            next(); 
        } else {
            // Ako nije prijavljen, preusmjeri ga na stranicu za prijavu
            res.redirect('/auth/login');
        }
    },
    isAdmin: (req, res, next) => {
        if (req.session.user && req.session.user.uloga === 'administrator') {
            return next(); // Pusti ga dalje
        }
        res.status(403).send("Pristup odbijen. Samo za administratore.");
    },
    //provjera vlasnistva
    isOwner: async (req, res, next) => {
        //  Provjera da li postoji ulogovani korisnik (redundantno ako se koristi requireLogin prije)
        if (!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }
        console.log("Sadržaj req.session.user:", req.session.user);
        const knjigaId = req.params.id;
        const userId = req.session.user.id;

        try {
            const knjiga = await Knjiga.findByPk(knjigaId);

            if (!knjiga) {
                return res.redirect('/profil');
            }
            
            //ID VLASNIKA KNJIGE I ID ULOGOVANOG
            if (knjiga.prodavac_id.toString() === userId.toString()) {
                // Korisnik je vlasnik, dozvoli nastavak
                next(); 
            } else {
                // Nije vlasnik, ne dozvoli i preusmjeri
                res.redirect('/profil');
            }

        } catch (err) {
            console.error("Greška u isOwner middleware-u:", err);
            res.redirect('/profil');
        }
    }
    
};