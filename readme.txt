
BookExpress - Platforma za kupoprodaju i razmjenu polovnih i novih knjiga.


DODATNE SPECIFIKACIJE:

Dodana mogućnost promocije oglasa, server simulira obrađivanje transakcije sa vjerovatnoćom od 10% za odbijenu transakciju. Nakon uspješne transakcije
izdvojeni oglas će biti prikazan u rubrici izdvojeni oglasi.

Upute za dodavanja admina direktno u bazu:
1. U terminalu pokrenuti sljedecu liniju koda: node -e "console.log(require('bcrypt').hashSync('efra', 10))"
2. Rezultat je hesirana sifra bcyrpt biblioteke koja se dodaje u pw kolonu u bazi
3. Pokreni ovaj upit u bazi 

INSERT INTO "Korisnik" (
    ime, 
    prezime, 
    email, 
    lozinka_hash, 
    uloga, 
    status, 
    datum_registracije, 
    prosjecna_ocjena
) VALUES (
    'Admin', 
    'Prezime', 
    'admin@gmail.com', 
    'HEŠIRANA_ŠIFRA_OVDJE',
    'administrator', 
    'aktivan', 
    NOW(), 
    0.0
);
4. Uloguj se kao admin


