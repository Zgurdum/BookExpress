const recenzijaService = require('../Services/recenzija_service');

exports.showReviewForm = async (req, res) => {
    try {
        const { narudzba_id } = req.params;
        
        // Ko je prodavac i sta je kupljeno
        const narudzba = await recenzijaService.getOrderWithItems(narudzba_id);

        if (!narudzba) return res.send("Narudžba nije pronađena.");

        // Uzimamo prodavca iz prve knjige u narudžbi, mislim da ovo nece nikad vratit vise od jednog rezultata tako da nije potrebna logika prvog u nizu
        const prodavacId = narudzba.Stavke[0].Knjiga.prodavac_id;

        res.render('ostaviRecenziju', { narudzba, prodavacId });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.saveReview = async (req, res) => {
    try {
        const { narudzba_id, prodavac_id, ocjena, komentar } = req.body;
        const kupac_id = req.session.user.id;
        //provjera ima li ocjene za istu knjigu
        const vecOcjenjeno = await recenzijaService.checkIfAlreadyReviewed(narudzba_id);
        if (vecOcjenjeno) return res.send("Već ste ocijenili ovu narudžbu.");

        await recenzijaService.createReview({
            ocjena, komentar, narudzba_id, kupac_id, prodavac_id
        });

        res.redirect('/');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.showEditForm = async (req, res) => {
    try {
        const recenzija = await recenzijaService.getReviewById(req.params.id);
        //trebam provjeriti da li radim ovu logiku u kontroleru, ili je bolje u rutama
        if (!recenzija || recenzija.kupac_id !== req.session.user.id) {
            return res.status(403).send("Neovlašten pristup.");
        }
        res.render('urediRecenziju', { recenzija });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

//Prikazuje sve recenzije koje je taj korisnik ostavio
exports.showMyComments = async (req, res) => {
try {
        const komentari = await recenzijaService.prepareUserReviews(req.session.user.id);
        res.render('mojiKomentari', { komentari });
    } catch (error) {
        res.status(500).send("Greška pri učitavanju.");
    }
};

exports.updateReview = async (req, res) => {
    try {
        await recenzijaService.editReview(
            req.params.id, 
            req.session.user.id, 
            req.body.ocjena, 
            req.body.komentar
        );
        res.redirect('/recenzija/moji-komentari');
    } catch (error) {
        res.status(400).send(error.message);
    }
};