const promotionsService = require('../Services/promotionsService');
const knjigaService = require('../Services/knjiga_servisi');
//DODATNA SPECIFIKACIJA:transkacije
exports.getPromoteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.session.user.id;

        const book = await knjigaService.getBookDetails(bookId);

        if (!book) {
            return res.status(404).send("Knjiga nije pronađena");
        }

        if (book.prodavac_id !== userId) {
            return res.status(403).send("Nemate dozvolu za promociju ove knjige");
        }

        // Ako je vec promovisana vrati gresku - ovo sam rijesio na frontendu mogao bi sklonit odavde
        const existingPromotion = await promotionsService.getBookPromotionStatus(bookId);
        if (existingPromotion) {
            return res.redirect(`/knjige/${bookId}?error=Knjiga je već promovisana`);
        }

        res.render('promoteBook', {
            book: book,
            user: req.session.user,
            promotionPrice: 2.50 // Fiksan iznos promocije za sad
        });

    } catch (error) {
        console.error("Greška pri učitavanju stranice za promociju:", error);
        res.status(500).send("Greška na serveru");
    }
};

//Simulira obradu transkacije
exports.processPromotionPayment = async (req, res) => {
    try {
        console.log('Payment request body:', req.body);
        const { bookId, amount, cardNumber, expiryDate, cvv, cardholderName } = req.body;
        const userId = req.session.user.id;

        console.log('Podaci iz req.bodija:', { bookId, amount, cardNumber, expiryDate, cvv, cardholderName });

        // sva polja obavezna
        if (!bookId || !amount || !cardNumber || !expiryDate || !cvv || !cardholderName) {
            console.log("SVa polja su obaveza - Nedostaju podaci:", {
                bookId: !bookId,
                amount: !amount,
                cardNumber: !cardNumber,
                expiryDate: !expiryDate,
                cvv: !cvv,
                cardholderName: !cardholderName
            });
            return res.status(400).json({ success: false, message: 'Svi podaci su obavezni' });
        }

        // Servis uzima podatke i "obradjuje" placanje
        const paymentData = {
            cardNumber,
            expiryDate,
            cvv,
            cardholderName,
            amount: parseFloat(amount)
        };

        const result = await promotionsService.processPromotionPayment(bookId, userId, paymentData);

        res.json(result);

    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Došlo je do greške pri obradi plaćanja'
        });
    }
};

exports.getUserPromotions = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const promotions = await promotionsService.getUserPromotions(userId);

        res.render('userPromotions', {
            promotions: promotions,
            user: req.session.user
        });

    } catch (error) {
        console.error("Greška pri dohvatu korisničkih promocija:", error);
        res.status(500).send("Greška na serveru");
    }
};
//Privremeno sklonjena jer rusi stranicu
exports.cancelPromotion = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.session.user.id;

        const result = await promotionsService.cancelPromotion(bookId, userId);

        res.json(result);

    } catch (error) {
        console.error('Cancel promotion error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Došlo je do greške pri otkazivanju promocije'
        });
    }
};