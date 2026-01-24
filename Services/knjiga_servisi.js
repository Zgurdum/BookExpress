// Services/knjigaService.js 

const KnjigaDAO = require('../DAO/knjigaDao');
const promotionsDao = require('../DAO/promotionsDao');

async function getHomepageBooks() {
    // Uzimam 22 knjiga
    const dbBooks = await KnjigaDAO.get18RandomActiveBooks();
    
    // 
    const booksForView = dbBooks.map(book => {
        const plainBook = book.get({ plain: true }); 
        
        // //Cuva je kao string jer se js gubi sa float vrijednostima
        if (plainBook.cijena) {
            plainBook.cijena = parseFloat(plainBook.cijena);
        }
        
        return plainBook;
    });

    return booksForView;
}

async function getMoreHomepageBooks(offset = 0) {
    // Uzimam 18 knjiga sa offsetom
    const dbBooks = await KnjigaDAO.getMoreRandomActiveBooks(offset);
    
    // 
    const booksForView = dbBooks.map(book => {
        const plainBook = book.get({ plain: true }); 
        
        // //Cuva je kao string jer se js gubi sa float vrijednostima
        if (plainBook.cijena) {
            plainBook.cijena = parseFloat(plainBook.cijena);
        }
        
        return plainBook;
    });

    return booksForView;
}


async function getRecommendedBooks(userId, zanrIds, jezikIds) {
    try {
        console.log("Servis primio - Žanrovi:", zanrIds, "Jezici:", jezikIds);

        // Osiguravamo da su žanrovi niz brojeva
        const finalZanrovi = Array.isArray(zanrIds) 
            ? zanrIds.map(id => parseInt(id)).filter(id => !isNaN(id)) 
            : [];

        // Osiguravamo da su jezici niz brojeva (pošto je Many-to-Many)
        const finalJezici = Array.isArray(jezikIds) 
            ? jezikIds.map(id => parseInt(id)).filter(id => !isNaN(id)) 
            : [];

        // Ako korisnik nema ni jedan odabrani interes, vraćamo prazno odmah
        if (finalZanrovi.length === 0 && finalJezici.length === 0) {
            console.log("Nema interesa za korisnika, preporuke preskočene.");
            return [];
        }

        console.log("Šaljem u DAO pročišćene nizove...");
        return await KnjigaDAO.getSuggestions(finalZanrovi, finalJezici, userId);

    } catch (error) {
        console.error("Greška u servisu kod preporuka:", error);
        return [];
    }
}

async function getHomepageBooksPopular() {
    // Popularne knjige
    return await KnjigaDAO.get6PopularBooks();
}
async function getFormData() {
    try {
        const [zanrovi, jezici, stanja] = await Promise.all([
            KnjigaDAO.getAllZanrovi(),
            KnjigaDAO.getAllJezici(),
            KnjigaDAO.getAllStanja(),
        ]);

        return { zanrovi, jezici, stanja };
    } catch (error) {
        console.error("SERVICE Greška pri dohvatu podataka za formu:", error);
        throw new Error("Neuspješno dohvatanje opcija za formu.");
    }
}
async function createKnjiga(bookData){
    const newBookData = {
        ...bookData,
        status_knjige: 'aktivna', // Automatski postavi status
        cijena: parseFloat(bookData.cijena) // string to float
    }

    const novaKnjiga = await KnjigaDAO.createKnjiga(newBookData);
    console.log("Napravljena nova knjiga:", novaKnjiga);
    return novaKnjiga;
}

//Dohvat stranice pojedinacne knjige

async function getBookDetails(knjigaId) {
console.log(`[SERVICE]: Obrada detalja za knjigu ID: ${knjigaId}`);
    
    // 
    const bookInstance = await KnjigaDAO.getBookDetailsById(knjigaId);

    if (!bookInstance) {
        return null;
    }

    const book = bookInstance.get({ plain: true });

    if (book.Zanr) {
        book.zanr = book.Zanr.naziv;
        delete book.Zanr; // Ne znam zasto
    }

    if (book.Jezik) {
        book.jezik = book.Jezik.naziv;
        delete book.Jezik;
    }

    if (book.Stanje) {
        book.stanje_knjige = book.Stanje.naziv_stanja; 
        delete book.Stanje;
    }
    if (book.cijena) {
        book.cijena = parseFloat(book.cijena); 
    }
    
    
    console.log(`[SERVICE]: Knjiga ${book.naziv} obrađena.`);
    return book;
}

async function getBookDetailsWithMeta(knjigaId, userId = null) {
    console.log(`[SERVICE]: Obrada detalja za knjigu ID: ${knjigaId} sa metapodacima`);
    
    const book = await getBookDetails(knjigaId);
    
    if (!book) {
        return null;
    }
    
    // Provjera vlasnistva
    const isOwner = userId && userId === book.prodavac_id;
    
    // Provjera da li je knjiga promovisana
    const promotion = await promotionsDao.getPromotionByBookId(knjigaId);
    const isPromoted = !!promotion;
    
    return {
        book,
        isOwner,
        isPromoted
    };
}


async function deleteKnjiga(knjigaId, userId) {
    //Obrisi knjigu
    const rezultatBrisanja = await KnjigaDAO.deleteKnjiga(knjigaId, userId);

    if (rezultatBrisanja && rezultatBrisanja.deletedCount > 0) {
        return rezultatBrisanja.knjigaNaziv; // Vrati naziv za Controller
    }
    return null; 
}

async function updateKnjiga(knjigaId, userId, updatedData) {

    const book = await KnjigaDAO.getBookDetailsById(knjigaId);
    
    if (!book) {
        throw new Error("Knjiga nije pronađena.");
    }
    //Provjerili smo ovo vec u kontroleru, ali on samo redirecta ovo nam kaze eror
    if (book.status_knjige === 'arhivirana') {
        throw new Error("Arhivirana knjiga ne može biti uređena.");
    }
    
    //kupljenje podatka za update
    const dataToUpdate = {
        naziv: updatedData.naziv,
        autor: updatedData.autor,
        izdavac: updatedData.izdavac,
        godina_izdanja: updatedData.godina_izdanja || null,
        zanr_id: updatedData.zanr_id,
        jezik_id: updatedData.jezik_id,
        stanje_id: updatedData.stanje_id,
        cijena: updatedData.cijena,
        mogucnost_razmjene: updatedData.mogucnost_razmjene,
        opis: updatedData.opis,
        // Ako ima url dodaj je
        ...(updatedData.fotografija_url && { fotografija_url: updatedData.fotografija_url })
    };

    return await KnjigaDAO.updateKnjiga(knjigaId, userId, dataToUpdate);
}

async function getKnjigeByUserId(userId) {
    //Dohvati knjige za korisnika
    return KnjigaDAO.getKnjigeByUserId(userId);
}

async function searchKnjige(query) {
    //search nad knjigama
    return await KnjigaDAO.searchKnjige(query);
}

async function getArhiviraneKnjigeByUserId(userId) {
    // Dohvati zavrsene
    return await KnjigaDAO.getArhiviraneKnjigePoKorisniku(userId);
}


module.exports = {
    getHomepageBooks,
    getMoreHomepageBooks,
    getHomepageBooksPopular,
    createKnjiga,
    getBookDetails, 
    getBookDetailsWithMeta,
    getFormData,
    deleteKnjiga,
    updateKnjiga,
    getKnjigeByUserId,
    searchKnjige,
    getArhiviraneKnjigeByUserId,
    getRecommendedBooks

};