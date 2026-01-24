

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('paymentForm');
    const payButton = document.getElementById('payButton');
    const buttonText = document.getElementById('buttonText');
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryInput = document.getElementById('expiryDate');

    // Formatirranje
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        e.target.value = formattedValue;
    });

    // datum isteka
    expiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // provjera
        const cardNumber = cardNumberInput.value.replace(/\s+/g, '');
        const expiry = expiryInput.value;
        const cvv = document.getElementById('cvv').value;
        const cardholderName = document.getElementById('cardholderName').value;

        if (cardNumber.length < 13 || cardNumber.length > 19) {
            showAlert('error', 'Nevažeći broj kartice');
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            showAlert('error', 'Nevažeći datum isteka');
            return;
        }

        if (cvv.length < 3 || cvv.length > 4) {
            showAlert('error', 'Nevažeći CVV');
            return;
        }

        if (!cardholderName.trim()) {
            showAlert('error', 'Unesite ime vlasnika kartice');
            return;
        }

        // simulacija transkacije ne mozes pritisnut pocne se vrtit
        payButton.disabled = true;
        buttonText.innerHTML = '<span class="loading-spinner"></span>Obrada plaćanja...';

        try {
            // koja je knjiga
            const bookId = form.querySelector('input[name="bookId"]').value;
            // plati od skrivenog input ili data atributa
            const amount = parseFloat(form.getAttribute('data-promotion-price')) || parseFloat(form.querySelector('input[name="amount"]').value) || 2.50;

            // i ovdje sam api probao
            const response = await fetch('/api/payment/process-promotion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookId: bookId,
                    amount: amount,
                    cardNumber: cardNumber,
                    expiryDate: expiry,
                    cvv: cvv,
                    cardholderName: cardholderName
                })
            });

            const result = await response.json();

            if (result.success) {
                showAlert('success', 'Plaćanje uspješno! Vaš oglas je sada promovisan.', function() {
                    window.location.href = `/knjige/${bookId}?success=promotion`;
                });
            } else {
                throw new Error(result.message || 'Došlo je do greške pri plaćanju');
            }

        } catch (error) {
            console.error('Payment error:', error);
            showAlert('error', error.message || 'Došlo je do greške pri plaćanju');
        } finally {

            payButton.disabled = false;

            const amountMatch = buttonText.textContent.match(/[\d.]+/);
            const originalAmount = amountMatch ? parseFloat(amountMatch[0]) : 2.50;
            buttonText.textContent = `Plati ${originalAmount.toFixed(2)} KM`;
        }
    });
});