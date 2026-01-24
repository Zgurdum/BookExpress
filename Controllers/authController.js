const AuthService = require('../Services/auth_service');
const lookupService = require('../Services/lookupService');


exports.getLoginForm = (req, res) => {
    // Renderuje login.ejs
    const success = req.query.success;
    const error = req.query.error;
    res.render('login', {
        title: 'Prijava',
        error: error || null,
        success: success || null,
        formData: {}
    });
};


//REGISTER
exports.getRegisterForm = async (req, res) => {
    try {
        //sve za prikaz odabira
        const lookupData = await lookupService.getAllLookupData();
        
        //saljemo kao niz i onda iteracija kroz stavke u frontendu
        res.render('register', {
            sveLokacije: lookupData.locations,
            sviZanrovi: lookupData.genres,
            sviJezici: lookupData.languages,
            title: 'Registracija',
            formData: {},
            error: null 
        });
    } catch (error) {
        console.error("Greška pri učitavanju podataka za formu:", error);
        res.render('register', { sveLokacije: [], sviZanrovi: [], sviJezici: [] });
    }
};


//LOGIN
exports.login = async (req, res) => {
    try {
        const { email, lozinka } = req.body;
        
        // Servis radi validaciju ne trba se ovdje to raditi u kontroleru
        const userData = await AuthService.loginUser(email, lozinka);

        // podatke korisnika spasimo u sesiju
        req.session.user = userData;
        console.log("Ulogovan korisnik:", userData);

        // Sačuva sesiju prije redirecta mozda je krsilo zbog redirecta
        req.session.save((err) => {
            if (err) {
                console.error("Greška pri čuvanju sesije:", err);
            }

            // Zavisno od Role servis odlucuje gdje korisnika prosljeduje
            const redirectUrl = AuthService.getPostLoginRedirectUrl(userData);
            return res.redirect(redirectUrl);
        });

    } catch (error) {
        res.render('login', {
            title: 'Prijava',
            error: error.message,
            success: null,
            formData: req.body
        });
    }
};

// Register akcija
exports.register = async (req, res) => {
    console.log("Form Data Received:", req.body);
    try {
        // servis obradjuje i validira
        const processedData = AuthService.processRegistrationData(req.body, req.file);
        
        // dio za dodavanje u bazu
        await AuthService.registerUser(processedData);

        console.log("--- REGISTRATION SUCCESSFUL ---");
        res.redirect('/auth/login?success=Registracija je uspješna! Sada se možete prijaviti');

    } catch (error) {
        console.error("--- REGISTRATION FAILED: ---", error);
        
        // ako ne uspije vratice ga na registraciju i bez ovog nije mi radilo iz nekog razloga
        const lookupData = await AuthService.getLookupDataForRegistrationError();
        
        res.render('register', {
            title: 'Registracija',
            error: error.message,
            formData: req.body,
            sveLokacije: lookupData.locations,
            sviJezici: lookupData.languages,
            sviZanrovi: lookupData.genres
        });
    }
};

exports.logout = (req, res) => {
    // Ova metoda uništava sesiju i briše cookies
    req.session.destroy(err => {
        if (err) {
            console.error("Greška pri odjavi (session destroy):", err);
            // U slučaju greske, preusmjeri na naslovnu stranicu
            return res.redirect('/'); 
        }
        // Uspjesna odjava: Preusmjeri na login stranicu, BOLJE VRATI GA NA hOMEPAGE
        res.redirect('/auth/login'); 
    });
};