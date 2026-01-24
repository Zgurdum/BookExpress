// Controllers/userController.js
const knjigaService = require('../Services/knjiga_servisi'); 
const userService = require('../Services/user_servisi');
const recenzijaService = require('../Services/recenzija_service');
const lookupService = require('../Services/lookupService'); 



exports.showProfile = async (req, res) => {
    const profilId = req.params.id; 
    
    try {
        // Sve je ovo neophodno prikazati jer mi tri dugmica nisu razlicite rute, sve i odma ucita
        const [korisnik, aktivneKnjige, zavrseneKnjige, podaciRecenzije] = await Promise.all([
            userService.getKorisnikDetails(profilId), 
            knjigaService.getKnjigeByUserId(profilId),
            knjigaService.getArhiviraneKnjigeByUserId(profilId),
            recenzijaService.getPodatkeZaProfil(profilId) //prikaze samo jednu rijesiti error
        ]);
        
        if (!korisnik) {
             return res.status(404).render('error', { message: 'Traženi profil nije pronađen.' });
        }
        
        const ulogovaniUserId = req.session.user ? req.session.user.id : null;
        const jeMojProfil = ulogovaniUserId && ulogovaniUserId.toString() === profilId.toString(); 

        res.render('profile', { 
            title: `Profil: ${korisnik.ime} ${korisnik.prezime}`,
            profilUser: korisnik,
            knjige: aktivneKnjige,
            zavrseniOglasi: zavrseneKnjige,
            jeMojProfil: jeMojProfil,
            recenzije: podaciRecenzije.lista,
            prosjecnaOcjena: podaciRecenzije.prosjek,
            ukupnoRecenzija: podaciRecenzije.ukupno
        });
    } catch (error) {
        console.error("Greška pri dohvatu javnog profila:", error);
        res.status(500).render('error', { title: 'Greška', message: 'Došlo je do greške na serveru.' });
    }
};

exports.showMyProfile = async (req, res) => {
    const user = req.session.user; 
    //mozda u ruti bolje radit
    if (!user || !user.id) {
        return res.redirect('/login'); 
    }

    try {
        const [aktivneKnjige, arhiviraneKnjige, podaciRecenzije] = await Promise.all([
            knjigaService.getKnjigeByUserId(user.id),
            knjigaService.getArhiviraneKnjigeByUserId(user.id),
            recenzijaService.getPodatkeZaProfil(user.id)
        ]);

        res.render('profile', {
            title: 'Moj Profil',
            profilUser: user, 
            knjige: aktivneKnjige,
            zavrseniOglasi: arhiviraneKnjige,
            jeMojProfil: true,
            // Recenzije
            recenzije: podaciRecenzije.lista,
            prosjecnaOcjena: podaciRecenzije.prosjek,
            ukupnoRecenzija: podaciRecenzije.ukupno
        });
    } catch (error) {
        console.error("Greška pri dohvaćanju knjiga za profil:", error);
        res.status(500).render('error', { title: 'Greška', message: 'Neuspješno učitavanje vaših knjiga.' });
    }
};
exports.renderEditProfilePage = async (req, res) => {
    try {
        const userId = req.session.user.id; 
        
        const user = await userService.getKorisnikForProfileEdit(userId);

        // iz lookap tabele izvlacimo sve moguce
        const lookupData = await lookupService.getAllLookupData();

        // Proslijedjujjemo kao nizove
        const userZanroviIds = user.InteresiZanrovi ? user.InteresiZanrovi.map(z => z.zanr_id) : [];
        const userJeziciIds = user.InteresiJezici ? user.InteresiJezici.map(j => j.jezik_id) : [];

        res.render('editProfil', { 
            user, 
            sveLokacije: lookupData.locations, 
            sviZanrovi: lookupData.genres, 
            sviJezici: lookupData.languages,
            userZanroviIds,
            userJeziciIds
        });
    } catch (err) {
        console.error('Kontroler Greška pri renderu edita:', err);
        res.status(500).send('Greška pri učitavanju forme za profil');
    }
};
exports.handleUpdateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { ime, prezime, lokacija_id, zanrovi, jezici } = req.body;

        // Pripremamo podatke za servis
        // Ako je izabran samo jedan checkbox, body.zanrovi će biti string ako ih ima vise onda je niz
        // zbog tog se koristi map number
        const podaciZaUpdate = {
            ime,
            prezime,
            lokacija_id: lokacija_id ? parseInt(lokacija_id) : null,
            zanrovi_ids: Array.isArray(zanrovi) ? zanrovi.map(Number) : (zanrovi ? [Number(zanrovi)] : []),
            jezici_ids: Array.isArray(jezici) ? jezici.map(Number) : (jezici ? [Number(jezici)] : [])
        };

        const updatedUser = await userService.editUserProfile(userId, podaciZaUpdate, req.file);

        if (updatedUser) {
            // apdejt
            req.session.user.ime = updatedUser.ime;
            req.session.user.prezime = updatedUser.prezime;
            req.session.user.lokacija_id = updatedUser.lokacija_id;
            req.session.user.profilna_slika_url = updatedUser.profilna_slika_url;

            req.session.save((err) => {
                if (err) console.error('Sesija error:', err);
                res.redirect('/users/profil/'); 
            });
        } else {
            res.redirect('/users/profil/');
        }

    } catch (error) {
        console.error('Kontroler Greška pri snimanju:', error);
        res.redirect('/users/profil/edit?error=true');
    }
};