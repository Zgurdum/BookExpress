const knjigaService = require('../Services/knjiga_servisi'); 
const userService = require('../Services/user_servisi');
const promotionsService = require('../Services/promotionsService');
exports.getHomepage = async (req, res) => {
    try {
        console.log("Ulazim u getHomepage...");

        //Identifikacija korisnika
        const userSession = req.user || req.session.user; 
        let fullUser = null;

        const promises = [
            knjigaService.getHomepageBooks(),
            knjigaService.getHomepageBooksPopular(),
            promotionsService.getActivePromotions()
        ];

        // Ako je ulogovan trazimo interesa
        if (userSession) {
            console.log("Korisnik prepoznat, dohvatam interese iz baze za:", userSession.ime);
            
            // Dohvatamo korisnika sa interesima kroz servis
            fullUser = await userService.getUserWithInterests(userSession.id);

            if (fullUser) {
                console.log("Pronađeni žanrovi (ID):", fullUser.zanrIds);
                console.log("Pronađeni jezici (ID):", fullUser.jezikIds);

                // Dodajemo treći promise za preporuke
                promises.push(knjigaService.getRecommendedBooks(fullUser.id, fullUser.zanrIds, fullUser.jezikIds));
            }
        }

        const rezultati = await Promise.all(promises);

        const randBooks = rezultati[0];
        const popularBooks = rezultati[1];
        const promotedBooks = rezultati[2] || [];
        const recommendedBooks = rezultati[3] || [];

        res.render('landingPage', { 
            title: 'Naslovna Stranica',
            books: randBooks,
            popularBooks: popularBooks,
            promotedBooks: promotedBooks,
            recommendedBooks: recommendedBooks,
            user: fullUser || userSession, // Koristim fullUser ako imamo, zbog profilne i sl.
            error: null
        });

        console.log("Preporuke uspješno renderovane, broj:", recommendedBooks.length);

    } catch (err) {
        console.error("greska u getHomepage:", err);
        res.render('landingPage', { 
            title: 'Greška',
            books: [], 
            popularBooks: [], 
            promotedBooks: [],
            recommendedBooks: [],
            user: req.user || req.session.user || null,
            error: "Problem sa učitavanjem naslovne stranice." 
        });
    }
};

exports.getPublishBookForm = async (req, res, next) => {
    try {
        console.log("[CONTROLLER]: Prikazuje se formular za dodavanje knjige.");
        
        // dohvatamo podatke za formu
        const formData = await knjigaService.getFormData(); 

        res.render('objaviKnjigu', {
            title: 'Objavi novu knjigu',
            error: null,
            zanrovi: formData.zanrovi,
            jezici: formData.jezici,
            stanja: formData.stanja,
            formData: null, // Prazni podaci na prvom učitavanju
        });
    } catch (error) {
        next(error); 
    }
};

exports.postPublishBook = async (req, res, next) => {
    console.log("[CONTROLLER]: Primljen POST zahtjev za objavljivanje knjige.");
    
    // Multer je obradio upload i fajl je u req.file
    
    // Prikupljanje podataka iz tijela zahtjeva i sesije
    const bookData = {
        zanr_id: parseInt(req.body.zanr_id), 
        jezik_id: parseInt(req.body.jezik_id),
        stanje_id: parseInt(req.body.stanje_id),
        cijena: req.body.cijena, 
        
        // Tekstualni podaci
        naziv: req.body.naziv,
        autor: req.body.autor,
        izdavac: req.body.izdavac,
        godina_izdanja: req.body.godina_izdanja ? parseInt(req.body.godina_izdanja) : null,
        opis: req.body.opis,
        
        // Logički podaci i prodavac
        mogucnost_razmjene: !!req.body.mogucnost_razmjene,
        prodavac_id: req.session.user ? req.session.user.id : null, // Morate biti prijavljeni!
        
        // Putanja do fotografije
        fotografija_url: req.file 
            ? `/uploads/knjige/${req.file.filename}` 
            : '/images/placeholder.jpg',
    };

    if (!bookData.prodavac_id) {
        // Rukovanje greškom ako korisnik nije prijavljen
        return res.status(401).redirect('/auth/login'); 
    }

    try {
        // servis zaduzen za dodavanje knjige
        const novaKnjiga = await knjigaService.createKnjiga(bookData); 
        
        console.log(`[CONTROLLER]: Knjiga ID ${novaKnjiga.id} dodana. Preusmjeravanje.`);
        
        res.redirect(`/knjige/${novaKnjiga.id}?success=Knjiga je uspješno objavljena`); 

    } catch (error) {
        console.error("[CONTROLLER]: Greška pri objavljivanju knjige.", error);
        
        // Na grešku, dohvatamo ponovo lookup podatke i vracam korisnika na formu
        const formData = await knjigaService.getFormData();
        
        res.render('objaviKnjigu', {
            title: 'Objavi novu knjigu',
            error: 'Došlo je do greške pri snimanju. Molimo provjerite podatke.',
            zanrovi: formData.zanrovi,
            jezici: formData.jezici,
            stanja: formData.stanja,
            formData: req.body // Vraćamo unesene podatke da ne nestanu iz formi
        });
    }
};

exports.getBookDetails = async (req, res) => {
    const knjigaId = req.params.id; 

    try {
        console.log(`[Kontroler]: Dohvat detalja za Knjigu ID: ${knjigaId}`);
        
        // Poziv Servisa za dohvat i obradu podataka sa SVIM podacima knjige
        const result = await knjigaService.getBookDetailsWithMeta(knjigaId, req.session.user ? req.session.user.id : null);

        if (!result) {
            // Ako knjiga ne postoji
            return res.status(404).render('error', { 
                title: '404', 
                message: 'Tražena knjiga nije pronađena.' 
            });
        }
        
        res.render('knjige/detalji', {
            title: result.book.naziv,
            book: result.book,
            isOwner: result.isOwner,
            isPromoted: result.isPromoted
        });

    } catch (error) {
        console.error("Greška pri dohvatu detalja knjige:", error);
        res.status(500).render('error', { title: 'Greška', message: 'Došlo je do greške na serveru.' });
    }
};

exports.deleteBook = async (req, res) => {
    const knjigaId = req.params.id;
    
    const userId = req.session.user.id; 
    console.log(`[CONTROLLER]: Zahtjev za brisanje knjige ID: ${knjigaId} od korisnika ID: ${userId}`);
    try {
        
        const deletedBookName = await knjigaService.deleteKnjiga(knjigaId, userId);
        
        // deletedBookName će biti null ako knjiga nije obrisana

        if (deletedBookName) {
            res.redirect('/users/profil?success=Knjiga je uspješno obrisana');
        } else {
            res.redirect('/users/profil?error=Knjiga nije pronađena ili niste ovlašteni za brisanje');
        }
        
    } catch (error) {
        console.error("Greška pri brisanju knjige:", error);
        res.redirect('/users/profil?error=Došlo je do greške prilikom pokušaja brisanja knjige');
    }
};

exports.getEditKnjiga = async (req, res) => {
    const knjigaId = req.params.id;
    try {
        // Dohvat detalja knjige i liste kategorija (zanrovi, jezici, stanja)
        const [book, kategorije] = await Promise.all([
            knjigaService.getBookDetails(knjigaId),
            knjigaService.getFormData() // Vraca { zanrovi, jezici, stanja }
        ]);

        if (!book) {
            return res.status(404).render('error', { message: 'Knjiga za uređivanje nije pronađena.' });
        }

        // Ako je knjiga vec prodana, redirect
        if (book.status_knjige === 'arhivirana') {
            return res.redirect(`/knjige/${knjigaId}?error=Arhivirana knjiga ne može biti uređena`);
        }
        
        res.render('knjige/editujKnjigu', {
            title: `Uredi ${book.naziv}`,
            book: book,
            zanrovi: kategorije.zanrovi,
            jezici: kategorije.jezici,
            stanja: kategorije.stanja
        });

    } catch (error) {
        console.error("Greška pri dohvatu forme za uređivanje:", error);
        req.flash('error', 'Nije moguće dohvatiti podatke za uređivanje.');
        res.redirect('/profil'); 
    }
};

//update
exports.updateKnjiga = async (req, res) => {
    const knjigaId = req.params.id;
    const userId = req.session.user.id;
    
    // Objekat koji sadrži sve podatke iz forme
    const updatedBookData = req.body;
    
    // Dodavanje URL-a nove fotografije, ako postoji
    if (req.file) {
        updatedBookData.fotografija_url = `/uploads/knjige/${req.file.filename}`;
    }

    // Bez ovog je padala stranica
    updatedBookData.mogucnost_razmjene = !!updatedBookData.mogucnost_razmjene;

    try {
        //delegacijaaa
        const updatedBook = await knjigaService.updateKnjiga(knjigaId, userId, updatedBookData);

        if (!updatedBook) {
            return res.redirect(`/knjige/detalji/${knjigaId}?error=Ažuriranje nije uspjelo. Knjiga nije pronađena ili niste vlasnik`);
        }

        res.redirect(`/knjige/${knjigaId}?success=Knjiga je uspješno ažurirana`);

    } catch (error) {
        console.error("Greška pri ažuriranju knjige:", error);
        
        // U slucaju da je eror vezan za pokusaj editovanja arhivirane knjige, novi url da bi sweealert odradio alert
        if (error.message === "Arhivirana knjiga ne može biti uređena.") {
            return res.redirect(`/knjige/${knjigaId}?error=Arhivirana%20knjiga%20ne%20može%20biti%20uređena`);
        }
        
        res.redirect(`/knjige/edit/${knjigaId}?error=Došlo je do greške pri čuvanju izmjena`);
    }
};

exports.search = async (req, res) => {
    try {
        const filters = req.query;
        
        // Umjesto tri odvojena poziva, koristimo searchKnjige i getFormData
        const books = await knjigaService.searchKnjige(filters);
        const formData = await knjigaService.getFormData(); // Vraća { zanrovi, jezici, stanja }

        res.render('landingPage', {
            title: 'Rezultati pretrage',
            books: books,
            popularBooks: [],
            promotedBooks: [],
            recommendedBooks: [],
            zanrovi: formData.zanrovi, 
            jezici: formData.jezici,   
            searchQuery: filters.q || '',
            selectedZanr: filters.zanr || '',
            selectedJezik: filters.jezik || '',
            minCijena: filters.minCijena || '',
            maxCijena: filters.maxCijena || '',
            sort: filters.sort || 'novo',
            user: req.user || req.session.user || null,
            error: null
        });
    } catch (error) {
        console.error("KONTROLER GREŠKA:", error);
        res.status(500).send("Greška: " + error.message);
    }
};

exports.getMoreBooks = async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        
        const moreBooks = await knjigaService.getMoreHomepageBooks(offset);
        
        res.json({
            success: true,
            books: moreBooks
        });
    } catch (error) {
        console.error("Greška pri dohvatu više knjiga:", error);
        res.status(500).json({
            success: false,
            message: "Greška pri dohvatu knjiga"
        });
    }
};