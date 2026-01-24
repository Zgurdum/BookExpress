function filterBooks() {
    const searchVal = document.getElementById('searchName').value.toLowerCase();
    const priceSort = document.getElementById('sortPrice').value;
    const dateSort = document.getElementById('sortDate').value;
    
    // Pronađi kontejner u AKTIVNOM tabu
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;
    const container = activeTab.querySelector('.book-grid-container');
    if (!container) return;

    // SVE kartice iz tog kontejnera
    const cards = Array.from(container.querySelectorAll('.book-card'));

    // Prvo Filtriranje (Prikaži/Sakrij)
    cards.forEach(card => {
        const name = card.getAttribute('data-name') || "";
        if (name.includes(searchVal)) {
            card.style.display = ""; // Vraća na CSS default (grid/block)
        } else {
            card.style.display = "none";
        }
    });

    // Sortiranje (Samo onih koje su ostale vidljive)
    const visibleCards = cards.filter(card => card.style.display !== "none");

    visibleCards.sort((a, b) => {
        // Sort po cijeni
        if (priceSort !== 'default') {
            const priceA = parseFloat(a.getAttribute('data-price')) || 0;
            const priceB = parseFloat(b.getAttribute('data-price')) || 0;
            return priceSort === 'low' ? priceA - priceB : priceB - priceA;
        }
        // Sort po datumu (ako cijena nije izabrana)
        const dateA = parseInt(a.getAttribute('data-date')) || 0;
            const dateB = parseInt(b.getAttribute('data-date')) || 0;

            if (dateSort === 'newest') {
                return dateB - dateA; // Veći broj (noviji datum) ide prvi
            } else {
                return dateA - dateB; // Manji broj (stariji datum) ide prvi
            }
    });

    // kartice dodaj u kontejner na kraju
    
    visibleCards.forEach(card => {
        container.appendChild(card);
    });

    // ni ovo ne rjesava problem padanja
    if (window.lenis) window.lenis.update();
}