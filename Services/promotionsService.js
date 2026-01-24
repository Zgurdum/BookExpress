const promotionsDao = require('../DAO/promotionsDao');
const knjigaService = require('./knjiga_servisi');

async function processPromotionPayment(bookId, userId, paymentData) {
    try {
        // Validate book ownership
        const book = await knjigaService.getBookDetails(bookId);
        if (!book || book.prodavac_id !== userId) {
            throw new Error('Nemate dozvolu za promociju ove knjige');
        }

        // Ako je vec promovisa da ne moze, frontend stiti ovo vec
        const existingPromotion = await promotionsDao.getPromotionByBookId(bookId);
        if (existingPromotion) {
            throw new Error('Ova knjiga je već promovisana');
        }

        // Simuliranje obrade placanja
        const paymentResult = await simulatePaymentProcessing(paymentData);

        if (!paymentResult.success) {
            throw new Error(paymentResult.message);
        }

        // Create promotion record
        const promotionData = {
            bookId: bookId,
            userId: userId,
            amount: paymentData.amount,
            transactionId: paymentResult.transactionId
        };

        await promotionsDao.createPromotionRecord(promotionData);

        return {
            success: true,
            message: 'Knjiga uspješno promovisana',
            transactionId: paymentResult.transactionId
        };

    } catch (error) {
        console.error('Promotion payment processing error:', error);
        throw error;
    }
}

async function simulatePaymentProcessing(paymentData) {
    // Malo vrti da izgleda kao da se nesto desava
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Provjere podataka
    const { cardNumber, expiryDate, cvv, cardholderName, amount } = paymentData;

    const isValidCard = cardNumber.length >= 13 && cardNumber.length <= 19;
    const isValidExpiry = /^\d{2}\/\d{2}$/.test(expiryDate);
    const isValidCvv = cvv.length >= 3 && cvv.length <= 4;
    const isValidAmount = amount > 0;

    if (!isValidCard || !isValidExpiry || !isValidCvv || !isValidAmount) {
        return {
            success: false,
            message: 'Nevažeći podaci plaćanja'
        };
    }

    // Simulacija nasumicnog odbijanja placanja, npr banka odbije transkaciju
    if (Math.random() < 0.1) {
        return {
            success: false,
            message: 'Plaćanje odbijeno od strane banke'
        };
    }

    return {
        success: true,
        transactionId: 'MONRI_' + Date.now(),
        message: 'Plaćanje uspješno obrađeno'
    };
}

async function getBookPromotionStatus(bookId) {
    return await promotionsDao.getPromotionByBookId(bookId);
}

async function getUserPromotions(userId) {
    return await promotionsDao.getUserPromotions(userId);
}

//Ne koristi se na frontenu
async function cancelPromotion(bookId, userId) {
    try {
        const promotion = await promotionsDao.getPromotionByBookId(bookId);

        if (!promotion || promotion.korisnik_id !== userId) {
            throw new Error('Nemate dozvolu za otkazivanje ove promocije');
        }

        await promotionsDao.deactivatePromotion(bookId);

        return {
            success: true,
            message: 'Promocija uspješno otkazana'
        };

    } catch (error) {
        console.error('Cancel promotion error:', error);
        throw error;
    }
}

async function getActivePromotions() {
    return await promotionsDao.getActivePromotions();
}

module.exports = {
    processPromotionPayment,
    simulatePaymentProcessing,
    getBookPromotionStatus,
    getUserPromotions,
    cancelPromotion,
    getActivePromotions
};