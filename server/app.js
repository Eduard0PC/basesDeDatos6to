
//MAIN APP FILE :0

const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./auth');
const userRoutes = require('./user');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Importar rutas
app.use('/', authRoutes);
app.use('/', userRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
