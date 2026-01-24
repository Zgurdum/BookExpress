
const reportsService = require('../Services/reportsService');

exports.getReportForm = async (req, res) => {
  try {
    const userToReport = await reportsService.getUserById(req.params.id);
    if (!userToReport) return res.status(404).send('Korisnik nije pronađen');

    res.render('reports/new', { userToReport });
  } catch (err) {
    res.status(500).send('Greška na serveru');
  }
};

exports.submitReport = async (req, res) => {
  try {
    const reportedId = req.params.id;
    const reporterId = req.session.user.id;
    console.log(reportedId, reporterId)
    await reportsService.createReport({
      title: req.body.title,
      content: req.body.content,
      reporterId: reporterId,
      reportedId: reportedId
    });
    res.redirect('/users/profil/' + req.params.id + '?success=reported');
  } catch (err) {
    res.status(500).json({
      poruka: "Greška u bazi",
      detalji: err.message,
      sqlGreška: err.parent ? err.parent.sqlMessage : "Nema SQL detalja",
      polja: err.fields
    });
  }
};