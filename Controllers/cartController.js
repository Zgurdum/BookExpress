const cartService = require('../Services/cart_service');
const knjigaService = require('../Services/knjiga_servisi');

exports.addToCart = async (req, res) => {
    try {
        const {knjiga_id} = req.body;
        const korisnik_id = req.session.user.id; // User id iz sesije
        if (!knjiga_id) {
            return res.status(400).send('Knjiga ID je obavezan.');
        }
        //brojac
        const rezultat = await cartService.addToCart(knjiga_id, korisnik_id);
        //Da bi znao sta ce prikazat
        const knjiga = await knjigaService.getBookDetails(knjiga_id); //Koristim service da nadjem knjigu
        return res.status(200).json({
            message: 'Knjiga je uspješno dodana u korpu.',
            cartCount: rezultat.newCount,
            knjiga_naziv: knjiga.naziv,
            knjiga_cijena: Number(knjiga.cijena).toFixed(2), // Formatiranje cijene na 2 decimale također Postgres salje decimalne vrijednosti kao string nekad jer je JS neprecizan
            knjiga_id: knjiga.id
        });
    } catch (error) {
        console.error('Greška pri dodavanju u korpu:', error);
        return res.status(500).send('Došlo je do greške prilikom dodavanja u korpu.');
    }
};
exports.getCartItems = async (req, res) => {
    try {
        // Provjeri je li korisnik ulogovan (bez redirecta, samo JSON)
        if (!req.session || !req.session.user || !req.session.user.id) {
            console.log("Zahtjev za korpu bez autentifikacije");
            return res.status(401).json([]);
        }

        const korisnik_id = req.session.user.id;
        const stavke = await cartService.getAllItems(korisnik_id);
        
        console.log(` Korpa učitana za korisnika ${korisnik_id}, stavki: ${stavke.length}`);
        res.json(stavke);
    } catch (error) {
        console.error("Greška pri dohvatu korpe:", error);
        res.status(500).json({ error: error.message });
    }
};

//sklanjamo stavku iz korpe uzimamo knjiga_id i user_id kako bi se uvjerili da tacno ta stavka pripada tacno tom korisniku

exports.removeFromCart = async (req, res) => {
    try {
        // Provjeri autentifikaciju bez redirecta
        if (!req.session || !req.session.user || !req.session.user.id) {
            return res.status(401).json({ success: false, error: "Niste autentifikovani" });
        }

        const knjiga_id = req.params.id;
        const korisnik_id = req.session.user.id;

        console.log(`🗑️ Uklanjanje knjige ${knjiga_id} iz korpe korisnika ${korisnik_id}`);
        
        await cartService.removeFromCart(korisnik_id, knjiga_id);
        res.status(200).json({ success: true, message: "Obrisano" });
    } catch (error) {
        console.error("❌ Greška pri uklanjanju iz korpe:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};