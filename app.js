var createError = require('http-errors');
var express = require('express');
var path = require('path');
const methodOverride = require('method-override'); //Za overrajd kad koristimo POST formu za slanje Delete zahtjeva moze ovo umjest ajaxa
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("dotenv").config();
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var knjigeRouter = require('./routes/knjiga');
var authentificationRouter = require('./routes/authentification');
var cartRouter = require('./routes/cart');
var messagesRouter = require('./routes/messages');
var narudzbeRouter = require('./routes/narudzba');
var recenzijaRouter = require('./routes/recenzija')
var adminRouter = require('./routes/admin')
var reportRouter = require('./routes/report')
var paymentRouter = require('./routes/payment')
const db = require('./Models/Index');

const app = express();
const http = require('http'); //da bi soketi radili moramo ovo raditi





const session = require('express-session'); // za sesije
const sessionMiddleware = require('./Middleware/sessionMiddleware');  // Uvozimo naš session middleware

// Koristi session middleware globalno
// Ovo će osigurati da su res.locals.user i res.locals.isAuthenticated dostupni u svim EJS pogledima

const { sequelize } = db;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json()); // citanje JSON podataka iz ajaxa zahtjeva
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: 'YOUR_VERY_SECRET_KEY', // Tajni kljuc
    resave: false,                  // 
    saveUninitialized: false,       // 
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 1000 * 60 * 60 * 24 
    }
}));
app.use(sessionMiddleware); //za svaki request
app.use(methodOverride('_method'));

app.use('/users', usersRouter);
app.use('/', indexRouter);
app.use('/knjige', knjigeRouter);
app.use('/auth', authentificationRouter);
app.use('/cart', cartRouter); 
app.use('/messages', messagesRouter);
app.use('/orders', narudzbeRouter);
app.use('/recenzija', recenzijaRouter);
app.use('/admin', adminRouter);
app.use('/reports', reportRouter);
app.use('/api/payment', paymentRouter);



// 404 STRANICU NAPRAVIT
app.use(function(req, res, next) {
  next(createError(404));
});


sequelize
    .sync({ alter: true }) // KREIRAJ TABELE PONOVO
    .then(() => console.log("✅ Models synced: Tables recreated."))
    .catch((err) => console.error("❌ Sync error:", err));


app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
