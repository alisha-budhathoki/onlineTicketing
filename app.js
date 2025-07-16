const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();

mongoose.connect('mongodb://localhost:27017/onlineTickets', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/onlineTickets' }),
    cookie: { }
  })
);

app.use('/', authRoutes);

app.get('/welcome', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('welcome', { firstName: req.session.firstName });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



