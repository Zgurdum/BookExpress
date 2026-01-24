// Services/userService.js

const bcrypt = require("bcrypt");
const userDao = require("../DAO/userDao"); 
const lookupService = require("./lookupService");

const saltRound = 10;

// Svi podaci iz registracije
async function registerUser({ ime, prezime, email, lozinka, zanrovi_ids, jezici_ids, lokacija_id, profilna_slika_url }) {
    // Ako vec postoji mail odbij registraciju
    const existing = await userDao.getByEmail(email);
    if (existing) {
        throw new Error("Email already in use.");
    }

    // hesiramo pw
    const hashedPassword = await bcrypt.hash(lozinka, saltRound);

    // dao pravi korisnika
    const user = await userDao.createKorisnik({
        ime,
        prezime,
        email,
        lozinka_hash: hashedPassword,
        uloga: 'kupac',     // Kupac je sve dok ne proda 1 artikl
        status: 'aktivan',
        profilna_slika_url,
        lokacija_id: lokacija_id || null
    });
    if (zanrovi_ids && zanrovi_ids.length > 0) {
    //preference
        await user.setInteresiZanrovi(zanrovi_ids); 
    }

    if (jezici_ids && jezici_ids.length > 0) {
        //preference
        await user.setInteresiJezici(jezici_ids);
    }

    // skloni se sifra priej vracanja podataka dobra praksa
    const { lozinka: _, ...safeUser } = user.get({ plain: true });
    return safeUser;
}

async function loginUser(email, lozinka) {
    //provjerimo postoji li mejl
    const user = await userDao.getByEmail(email);
    if (!user) {
        throw new Error("Invalid email or password.");
    }
    //poredimo unesenu sifru sa hesiranom
    const isMatch = await bcrypt.compare(lozinka, user.lozinka_hash);
    if (!isMatch) {
        throw new Error("Invalid email or password.");
    }

    
    if (user.status_naloga === 'blokiran') {
        const sada = new Date();
        
        // Ako je prosao privremeni blok, promjeni mu status i pusti ga na login
        if (user.blokiran_do && sada > new Date(user.blokiran_do)) {
            await user.update({ status_naloga: 'aktivan', blokiran_do: null });
        } else {
            // Ako ne, baci grešku s porukom
            let poruka = "Vaš nalog je blokiran.";
            if (user.blokiran_do) {
                const datum = new Date(user.blokiran_do).toLocaleDateString('hr-HR');
                poruka = `Vaš nalog je privremeno blokiran do: ${datum}`;
            }
            throw new Error(poruka);
        }
    }

    const { lozinka_hash: _, ...safeUser } = user.get({ plain: true });
    return safeUser;
}

// obradjivanje podataka
function processRegistrationData(formData, uploadedFile) {
    const { ime, prezime, email, lozinka, zanrovi, jezici, lokacija_id } = formData;
    
    // file upload filename i lokacije
    const profilna_slika_url = uploadedFile 
        ? `/uploads/profili/${uploadedFile.filename}` 
        : '/uploads/profili/default-avatar.png';
    
    // Vrati funkcija koja ce sad ovo smjestit u bazu
    const processedData = {
        ime, 
        prezime, 
        email, 
        lozinka, 
        zanrovi_ids: Array.isArray(zanrovi) ? zanrovi.map(Number) : (zanrovi ? [Number(zanrovi)] : []),
        jezici_ids: Array.isArray(jezici) ? jezici.map(Number) : (jezici ? [Number(jezici)] : []),
        lokacija_id: lokacija_id ? parseInt(lokacija_id) : null,
        profilna_slika_url 
    };

    return processedData;
}

// Jednostavno nece bez ovog
async function getLookupDataForRegistrationError() {
    return await lookupService.getAllLookupData();
}

// AKo je admin redirect admin u suprotnom homepage
function getPostLoginRedirectUrl(user) {
    if (user.uloga === 'administrator') {
        return '/admin/dashboard'; 
    } else {
        return '/'; 
    }
}

module.exports = {
    registerUser,
    loginUser,
    processRegistrationData,
    getLookupDataForRegistrationError,
    getPostLoginRedirectUrl
};