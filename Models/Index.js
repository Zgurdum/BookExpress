const { sequelize } = require('../Database/database');
const { Sequelize } = require('sequelize');
const Knjige = require('./Knjiga'); 
const Korisnik = require('./Korisnik');
const Zanrovi= require('./Zanrovi');
const Jezik = require('./Jezik');
const StanjeKnjige = require('./StanjeKnjige');
const Korpa = require('./Korpa');
const Narudzba = require('./Narudzba');
const StavkaNarudzbe = require('./StavkaNarudzbe');
const ArhiviranaKnjiga = require('./ArhiviranaKnjiga')
const Recenzija = require('./Recenzija')
const Obavijesti = require('./Obavijesti')
const Lokacija = require('./Lokacija')
const Poruka = require('./Poruka')
const Report = require('./Report')
const Promotions = require('./Promotions')

//Ovo je najcisci pristup uspostavljanja relacija izmedju modela i bitno je kad se poziva ovaj fajl u app.jsu
const models = {
    Knjige: Knjige,
    Korisnik: Korisnik,
    Zanrovi: Zanrovi,
    Jezik: Jezik,
    Korpa: Korpa,
    StanjeKnjige: StanjeKnjige,
    Narudzba: Narudzba,
    StavkaNarudzbe: StavkaNarudzbe,
    ArhiviranaKnjiga: ArhiviranaKnjiga,
    Recenzija: Recenzija,
    Obavijesti: Obavijesti,
    Lokacija: Lokacija,
    Poruka: Poruka,
    Report: Report,
    Promotions: Promotions,
    sequelize: sequelize,
    Sequelize: Sequelize
};

Knjige.belongsTo(models.Korisnik, {
        foreignKey: 'prodavac_id',
        as: 'Prodavac'
});
    
    // Knjiga pripada jednom Žanru
Knjige.belongsTo(models.Zanrovi, { //
        foreignKey: 'zanr_id',
        as: 'Zanr'
});

// Knjiga pripada jednom Jeziku
Knjige.belongsTo(models.Jezik, {
    foreignKey: 'jezik_id',
    as: 'Jezik'
});

    // Knjiga pripada jednom Stanju Knjige
Knjige.belongsTo(models.StanjeKnjige, {
    foreignKey: 'stanje_id',
    as: 'Stanje'
});

Korisnik.hasMany(models.Knjige, { 
        foreignKey: 'prodavac_id',
        as: 'KnjigeZaProdaju' // Dajte asocijaciji specifičan alias za prodavca
    });

Zanrovi.hasMany(models.Knjige, {
    foreignKey: 'zanr_id',
    as: 'Knjige' // Alias za knjige koje pripadaju žanru
});

//Korisnik moze imati vise stavki u korpi
Korisnik.hasMany(models.Korpa, { 
    foreignKey: 'korisnik_id', 
    as: 'StavkeUKorpi' 
});

//Korpa pripada jednom korisniku
Korpa.belongsTo(models.Korisnik, { 
    foreignKey: 'korisnik_id',
    as: 'Kupac'
});
//Jedna stavka u korpi je jednaka jednoj knjizi
Korpa.belongsTo(models.Knjige, { 
    foreignKey: 'knjiga_id', 
    as: 'Knjiga' 
});


Knjige.hasMany(models.Korpa, { 
    foreignKey: 'knjiga_id',
    as: 'StavkeKorpe' 
});
Korisnik.hasMany(models.Narudzba, { 
    foreignKey: 'kupac_id', 
    as: 'MojeNarudzbe' 
});

// Narudžba pripada jednom korisniku (kupcu)
Narudzba.belongsTo(models.Korisnik, { 
    foreignKey: 'kupac_id', 
    as: 'Kupac' 
});

// Narudžba ima više stavki (proizvoda u sebi)
Narudzba.hasMany(models.StavkaNarudzbe, { 
    foreignKey: 'narudzba_id', 
    as: 'Stavke' 
});

// Stavka narudžbe pripada jednoj glavnoj narudžbi
StavkaNarudzbe.belongsTo(models.Narudzba, { 
    foreignKey: 'narudzba_id',
    as: 'GlavnaNarudzba'
});

// --- Relacije za STAVKE NARUDŽBE i KNJIGE ---

// Svaka stavka u narudžbi je zapravo jedna kupljena knjiga
StavkaNarudzbe.belongsTo(models.Knjige, { 
    foreignKey: 'knjiga_id',
    as: 'Knjiga' 
});

// Knjiga se može pojaviti u više različitih stavki narudžbi (kod različitih kupaca)
Knjige.hasMany(models.StavkaNarudzbe, { 
    foreignKey: 'knjiga_id',
    as: 'NaruceneStavke' 
});

Recenzija.belongsTo(models.Narudzba, { 
    foreignKey: 'narudzba_id', 
    as: 'PovezanaNarudzba'
});

// 2. Ko je ostavio recenziju (Kupac)
Recenzija.belongsTo(models.Korisnik, { 
    foreignKey: 'kupac_id',
     as: 'KupacRecenzent' 
});

// 3. Ko je ocijenjen (Prodavac)
Recenzija.belongsTo(models.Korisnik, { 
    foreignKey: 'prodavac_id',
     as: 'OcijenjeniProdavac'
});

Korisnik.hasMany(models.Obavijesti, { 
    foreignKey: 'korisnik_id', 
    as: 'Obavijesti' 
});

// Obavijest pripada jednom korisniku
Obavijesti.belongsTo(models.Korisnik, { 
    foreignKey: 'korisnik_id',
    as: 'Primalac'
});

// Obavijest se može vezati za konkretnu narudžbu (opciono)
Obavijesti.belongsTo(models.Narudzba, { 
    foreignKey: 'narudzba_id',
    as: 'PovezanaNarudzba'
});

Narudzba.hasMany(models.Obavijesti, { 
    foreignKey: 'narudzba_id',
    as: 'ObavijestiNarudzbe'
});

Lokacija.hasMany(Korisnik, {
    foreignKey: 'lokacija_id',
    as: 'Korisnici'
});

Korisnik.belongsTo(Lokacija, {
    foreignKey: 'lokacija_id',
    as: 'Lokacija'
});

Korisnik.belongsToMany(models.Zanrovi, { 
    through: 'KorisnikZanrovi', // Ime pomoćne tabele u bazi
    foreignKey: 'korisnik_id', 
    otherKey: 'zanr_id',
    as: 'InteresiZanrovi' 
});

// Žanr može zanimati više korisnika
Zanrovi.belongsToMany(models.Korisnik, { 
    through: 'KorisnikZanrovi', 
    foreignKey: 'zanr_id', 
    otherKey: 'korisnik_id' 
});

// Korisnik može znati/preferirati više jezika
Korisnik.belongsToMany(models.Jezik, { 
    through: 'KorisnikJezici', // Ime pomoćne tabele u bazi
    foreignKey: 'korisnik_id', 
    otherKey: 'jezik_id',
    as: 'InteresiJezici' 
});

// Jezik se može vezati za više korisnika
Jezik.belongsToMany(models.Korisnik, { 
    through: 'KorisnikJezici', 
    foreignKey: 'jezik_id', 
    otherKey: 'korisnik_id' 
});


// Korisnik može poslati mnogo poruka
Korisnik.hasMany(models.Poruka, { 
    foreignKey: 'posiljalac_id', 
    as: 'PoslanePoruke' 
});

// Korisnik može primiti mnogo poruka
Korisnik.hasMany(models.Poruka, { 
    foreignKey: 'primalac_id', 
    as: 'PrimljenePoruke' 
});

// Poruka pripada pošiljaocu
Poruka.belongsTo(models.Korisnik, { 
    foreignKey: 'posiljalac_id', 
    as: 'Posiljalac' 
});

// Poruka pripada primaocu
Poruka.belongsTo(models.Korisnik, { 
    foreignKey: 'primalac_id', 
    as: 'Primalac' 
});

Korisnik.hasMany(models.Report, {
    foreignKey: 'reporterId',
    as: 'PoslatiIzvještaji',
    onDelete: 'CASCADE'
});
Report.belongsTo(Korisnik, {
    foreignKey: 'reporterId',
    as: 'Reporter'
});

// Relacija 2: Ko je prijavljen (Reported User)
Korisnik.hasMany(models.Report, {
    foreignKey: 'reportedId',
    as: 'DobijenePrijave',
    onDelete: 'CASCADE'
});
Report.belongsTo(Korisnik, {
    foreignKey: 'reportedId',
    as: 'PrijavljeniKorisnik'
});

// Za promocije
Promotions.belongsTo(models.Knjige, {
    foreignKey: 'knjiga_id',
    as: 'Knjiga'
});
Promotions.belongsTo(models.Korisnik, {
    foreignKey: 'korisnik_id',
    as: 'Korisnik'
});
Knjige.hasMany(models.Promotions, {
    foreignKey: 'knjiga_id',
    as: 'Promotions'
});
Korisnik.hasMany(models.Promotions, {
    foreignKey: 'korisnik_id',
    as: 'Promotions'
});

module.exports = models;
