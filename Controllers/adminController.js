const AdminService = require('../Services/admin_service');

exports.getDashboard = async (req, res) => {
    try {
        const data = await AdminService.getAdminDashboardData();
        res.locals.activePage = 'statistika';
        res.render('admin/dashboard', { 
            data
        });
    } catch (error) {
        res.status(500).send("Greška pri učitavanju statistike.");
    }

};

exports.getUsersPage = async (req, res) => {
    try {
        const users = await AdminService.fetchUsersList();
        res.locals.activePage = 'korisnici';
        res.render('admin/korisnici', { 
            users
        });
    } catch (error) {
        console.error("greška", error);
        res.status(500).send("Greška pri učitavanju korisnika");
    }
};

exports.handleStatusChange = async (req, res) => {
    const { userId, status } = req.body;
    try {
        await AdminService.changeStatus(userId, status);
        res.redirect('/admin/korisnici');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.handleBlocking = async (req, res) => {
    const { userId, type } = req.body; // type može biti 'permanent' ili '15_days'
    try {
        await AdminService.processBlocking(userId, type);
        res.redirect('/admin/korisnici');
    } catch (error) {
        res.status(500).send("Greška pri blokiranju korisnika");
    }
};

exports.handleArchiving = async (req, res) => {
    const { userId } = req.params;
    try {
        await AdminService.archiveAccount(userId);
        res.status(200).send("Korisnik uspješno arhiviran");
    } catch (error) {
        res.status(500).send("Greška pri arhiviranju");
    }
};

exports.getAdminPanel = async (req, res) => {
    try {
        const data = await AdminService.getDashboardData();
        res.locals.activePage = 'katalog';
        res.render('admin/katalog', { 
            title: 'Admin Panel', 
            ...data 
        });
    } catch (error) {
        console.log(error)
        res.status(500).send("Greška pri učitavanju admin panela.");
    }
};


exports.addItem = async (req, res) => {
    try {
        const { tip, naziv } = req.body;
        await AdminService.createLookupItem(tip, naziv);
        res.redirect('/admin/katalog');
    } catch (error) {
        console.error("Greška pri dodavanju:", error);
        res.status(500).send("Greška pri spašavanju nove stavke.");
    }
};
exports.deleteItem = async (req, res) => {
    try {
        const { tip, id } = req.params;
        await AdminService.deleteLookupItem(tip, id);
        
        res.redirect('/admin/katalog');
    } catch (error) {
        console.error("Greška pri brisanju:", error);
        res.status(500).send("Ne možete obrisati stavku koja se već koristi u sistemu.");
    }
};

//sad imam jednu funkciju za update, a servis gleda sta ce apdejtat
exports.updateItem = async (req, res) => {
    try {
        const { tip, id, noviNaziv } = req.body;
        await AdminService.updateLookupItem(tip, id, noviNaziv);
        res.redirect('/admin/katalog');
    } catch (error) {
        res.status(500).send("Greška pri ažuriranju.");
    }
};
exports.getReportsPage = async (req, res) => {
    try {
        const reports = await AdminService.fetchReports();
        res.locals.activePage = 'reports';
        res.render('admin/reports', { title: 'Admin Reports', reports });
    } catch (error) {
        console.error("Greška pri učitavanju izvještaja:", error);
        res.status(500).send("Greška pri učitavanju izvještaja.");
    }
};