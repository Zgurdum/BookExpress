
  document.addEventListener('DOMContentLoaded', () => {
        // Učitaj korpu samo ako postoji ulogovan korisnik znaci ako postoji itemcontainer
        const cartItemsContainer = document.getElementById('cart-items');
        if (cartItemsContainer) {
            ucitajKorpuIzBaze();
        }

        // Ako se klikne bilo gdje osim na otvoreni meni izaci ce
        window.addEventListener('click', (event) => {
            const dropdown = document.getElementById('user-dropdown');
            const menuContainer = document.querySelector('.user-menu-container');
            
            // Ako klik nije unutar kontejnera menija, sakrij dropdown
            if (menuContainer && !menuContainer.contains(event.target)) {
                if (dropdown && dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                }
            }
        });
    });

    
    // Otvara/Zatvara meni korisnika
     
    function toggleUserMenu() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    /**
     * Fetch funkcija za stavke korpe
     */
    async function ucitajKorpuIzBaze() {
        try {
            console.log("🔍 Počinjam učitavanje korpe...");
            const response = await fetch('/cart/items');
            
            console.log("📍 Response status:", response.status, response.statusText);
            
            // Ako nije OK (npr. 401 Unauthorized), znači korisnik nije ulogovan
            if (!response.ok) {
                console.warn(`⚠️ Cart vratio status ${response.status} - korisnik nije autentifikovan`);
                const cartItemsContainer = document.getElementById('cart-items');
                if (cartItemsContainer) {
                    cartItemsContainer.innerHTML = '<p class="empty-msg">Korpa je prazna.</p>';
                }
                const totalAmountElement = document.getElementById('cart-total-amount');
                if (totalAmountElement) {
                    totalAmountElement.innerText = '0.00 KM';
                }
                return;
            }
            
            console.log("✅ Response je OK, parsiranje JSON-a...");
            const stavke = await response.json();
            
            console.log("📦 JSON parsiran, broj stavki:", stavke.length);
            console.log("📦 Sadržaj korpe:", stavke);
            
            const cartItemsContainer = document.getElementById('cart-items');
            const totalAmountElement = document.getElementById('cart-total-amount');

            if (!cartItemsContainer || !totalAmountElement) {
                console.error("❌ Cart container nije pronađen u DOM-u - cartItemsContainer:", !!cartItemsContainer, "- totalAmountElement:", !!totalAmountElement);
                return;
            }

            if (stavke && stavke.length > 0) {
                console.log("🛒 Prikazujem korpu sa stavkama...");
                cartItemsContainer.innerHTML = ''; // Oisti poruku prazna korpa
                let ukupnaCijena = 0;
                let prikazanihStavki = 0;

                stavke.forEach((stavka, index) => {
                    try {
                        console.log(`📍 Obrada stavke ${index}:`, stavka);
                        
                        // Provjeri da li stavka ima Knjiga svojstvo
                        if (!stavka.Knjiga) {
                            console.error(`⚠️ Stavka ${index} nema Knjiga svojstvo. Dostupna svojstva:`, Object.keys(stavka));
                            return; // Preskoči ovu stavku
                        }

                        const knjiga = stavka.Knjiga;
                        console.log(`  📚 Knjiga ID: ${knjiga.id}, naziv: ${knjiga.naziv}`);
                        
                        const cijena = Number(knjiga.cijena) || 0;
                        console.log(`  💰 Cijena: ${cijena}`);
                        
                        ukupnaCijena += cijena;

                        const html = `
                            <div class="cart-item" id="cart-item-${knjiga.id}">
                                <div class="cart-item-info">
                                    <p class="cart-item-title">${knjiga.naziv || 'Nepoznata knjiga'}</p>
                                    <p class="cart-item-price">${cijena.toFixed(2)} KM</p>
                                </div>
                                <button class="remove-item" onclick="ukloniIzKorpe('${knjiga.id}')">
                                    &times;
                                </button>
                            </div>
                        `;
                        cartItemsContainer.insertAdjacentHTML('beforeend', html);
                        prikazanihStavki++;
                    } catch (itemErr) {
                        console.error(`❌ Greška pri obradi stavke ${index}:`, itemErr);
                        console.error("Stavka koja je uzrokla gresku:", stavka);
                    }
                });

                totalAmountElement.innerText = `${ukupnaCijena.toFixed(2)} KM`;
                console.log(`✅ Korpa uspješno prikazana sa ${prikazanihStavki} stavki (od ${stavke.length})`);
            } else {
                console.log("📭 Korpa je prazna");
                cartItemsContainer.innerHTML = '<p class="empty-msg">Korpa je prazna.</p>';
                totalAmountElement.innerText = '0.00 KM';
            }
        } catch (err) {
            console.error("❌ GREŠKA PRI UČITAVANJU KORPE:", err);
            console.error("Error name:", err.name);
            console.error("Error message:", err.message);
            console.error("Stack trace:", err.stack);
            
            const cartItemsContainer = document.getElementById('cart-items');
            if (cartItemsContainer) {
                cartItemsContainer.innerHTML = `<p class="empty-msg">Greška: ${err.message}</p>`;
            }
        }
    }

    /**
     * Brisanje stavke iz korpe
     */
    async function ukloniIzKorpe(knjigaId) {
        try {
            const response = await fetch(`/cart/remove/${knjigaId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Brzo vizuelno uklanjanje
                const element = document.getElementById(`cart-item-${knjigaId}`);
                if (element) element.remove();
                
                // Ponovno preračunaj ukupno
                ucitajKorpuIzBaze(); 
            } else {
                showErrorAlert("Greška pri uklanjanju stavke.");
            }
        } catch (error) {
            console.error("Greška:", error);
        }
    }
    function toggleNotifications() {
    const drawer = document.getElementById('notif-drawer');
    const overlay = document.getElementById('notif-overlay');
    
    if (drawer && overlay) {
        drawer.classList.toggle('open');
        overlay.classList.toggle('show');
        
        // Ako se otvara, učitaj podatke
        if (drawer.classList.contains('open')) {
            ucitajObavijesti();
        }
    }
    }

    /**
     * Fetch obavijesti za prodavca
     */
    async function ucitajObavijesti() {
        try {
            const response = await fetch('/orders/obavijesti-prodavca');
            const data = await response.json(); // DATA SAD IMA ONAJ OBJEKAT KOJI JE RESPONSE 

            const container = document.getElementById('notif-items');
            if (!container) return;

            container.innerHTML = ''; // Čistimo sve

            // -DIO ZA ONOG KOJI PRODAJE
            if (data.zahtjeviZaProdaju && data.zahtjeviZaProdaju.length > 0) {
                data.zahtjeviZaProdaju.forEach(stavka => {
                    const html = `
                        <div class="cart-item" id="notif-row-${stavka.narudzba_id}">
                            <div class="cart-item-info">
                                <p><strong>${stavka.GlavnaNarudzba.Kupac.ime}</strong> želi kupiti:</p>
                                <p>"${stavka.Knjiga.naziv}"</p>
                            </div>
                            <div class="notif-actions">
                                <button onclick="odgovoriNaNarudzbu('${stavka.narudzba_id}', 'prihvati')" style="background:green; color:white;">Prihvati</button>
                                <button onclick="odgovoriNaNarudzbu('${stavka.narudzba_id}', 'odbij')" style="background:red; color:white;">Odbij</button>
                            </div>
                        </div><hr>`;
                    container.insertAdjacentHTML('beforeend', html);
                });
            }

            // DIO ZA KUPCA 
            if (data.potvrdeKupovine && data.potvrdeKupovine.length > 0) {
                data.potvrdeKupovine.forEach(n => {
                    const html = `
                        <div class="cart-item" style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 10px; margin-bottom: 10px;">
                            <p><strong>Info:</strong> ${n.poruka}</p>
                            
                            <div style="margin-top: 8px; display: flex; gap: 10px;">
                                <a href="/recenzija/ostavi/${n.narudzba_id}" 
                                style="background: #3b82f6; color: white; padding: 5px 10px; text-decoration: none; border-radius: 4px; font-size: 13px;">
                                Ocijeni prodavca
                                </a>

                                <button onclick="oznaciProcitano('${n.id}')" 
                                        style="background: #ccc; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 13px;">
                                        Skloni
                                </button>
                            </div>
                        </div><hr>`;
                    container.insertAdjacentHTML('beforeend', html);
                });
            }

            // Ako nema apsolutno niceg
            if (data.zahtjeviZaProdaju.length === 0 && data.potvrdeKupovine.length === 0) {
                container.innerHTML = '<p class="empty-msg">Nema novih obavijesti.</p>';
            }

        } catch (err) {
            console.error("Greška pri renderovanju:", err);
        }
    }

    //prihvati obij
    async function odgovoriNaNarudzbu(narudzbaId, akcija) {
        try {
            const response = await fetch('/orders/odgovori', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ narudzbaId, akcija })
            });

            const data = await response.json();
            if (data.success) {
                showSuccessAlert(`Narudžba ${akcija === 'prihvati' ? 'prihvaćena' : 'odbijena'}.`);
                ucitajObavijesti(); // Ponovo učitaj listu
            } else {
                showErrorAlert("Greška: " + data.error);
            }
        } catch (err) {
            console.error("Greška:", err);
        }
    }
async function oznaciProcitano(notifikacijaId) {
    try {
        const response = await fetch(`/orders/procitano/${notifikacijaId}`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {

            const element = document.querySelector(`button[onclick="oznaciProcitano('${notifikacijaId}')"]`).closest('.cart-item');
            if (element) {
                element.style.opacity = '0';
                setTimeout(() => element.remove(), 300);
            }
        } else {
            console.error("Greška pri označavanju obavijesti kao pročitane.");
        }
    } catch (error) {
        console.error("Mrežna greška:", error);
    }
}

async function toggleCart() {
        const drawer = document.getElementById('cart-drawer');
        const overlay = document.getElementById('cart-overlay');
        
        if (drawer && overlay) {
            // Ako otvaramo korpu, osvježi sadržaj prije nego što je prikaži
            if (!drawer.classList.contains('open')) {
                await ucitajKorpuIzBaze();
            }
            
            drawer.classList.toggle('open');
            overlay.classList.toggle('show');
        }
    }


async function goToCheckout() {
        // Provjera da li ima artikala prije nego što dopustimo checkout
        const items = document.querySelectorAll('.cart-item');
        if (items.length === 0) {
            showWarningAlert("Vaša korpa je prazna!");
            return;
        }
        window.location.href = '/orders/checkout';
    }

    //na esc izlazi iz korpe
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const drawer = document.getElementById('cart-drawer');
            if (drawer && drawer.classList.contains('open')) {
                toggleCart();
            }
        }
    });