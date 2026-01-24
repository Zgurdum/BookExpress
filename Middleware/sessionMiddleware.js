
module.exports = (req, res, next) => {
    // Provjeri da li postoji korisnik u sesiji
    if (req.session.user) {
        //AKO JE ULOGOVAN POSTAVI LOKALNU VARIJABLU KOJU MOGU KORISTITI U VIEWU DA KONTROLISEM STA RENDEROVATI
        res.locals.user = req.session.user;
        res.locals.isAuthenticated = true; //Pomocu ovog kontrolisem sta cu renderovat kome u headeru ili negdje drugo
    } else {
        
        res.locals.user = null;
        res.locals.isAuthenticated = false;
    }
    next();
};