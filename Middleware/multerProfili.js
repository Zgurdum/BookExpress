const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Putanja za profile
const PROFILI_DIR = path.join(__dirname, '..', 'public', 'uploads', 'profili');

if (!fs.existsSync(PROFILI_DIR)) {
    fs.mkdirSync(PROFILI_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, PROFILI_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Za profile je 2MB sasvim dovoljno
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Samo slike su dozvoljene!'), false);
        }
    }
});

// Polje u formi će se zvati 'profilna_slika'
module.exports = upload.single('profilna_slika');