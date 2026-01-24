//Multer odličan posao uradio za upload slika knjiga


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Odredišni folder za upload
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'knjige');

// Osigurajte da folder postoji
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Konfiguracija storage-a
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        // funkcija za nasumicno ime fajla
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit fajla na 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Samo slike su dozvoljene!'), false);
        }
    }
});

// Koristit ce samo jedno polje za upload ('fotografija')
const uploadMiddleware = upload.single('fotografija'); 

module.exports = uploadMiddleware;