const express = require('express');
const session = require('express-session');
//const bcryptjs = require('bcryptjs'); para encriptar contraseñas pero no se usara de mientras
const connection = require('./db');
const app = express();
const path = require('path'); //para poder usar navegar fuera de server

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Ruta para la página de inicio de sesión
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Ruta para validar el login
app.post('/login', (req, res) => {
    const { usuario, contrasenia } = req.body;
    
    connection.query('SELECT * FROM UsuariosNom WHERE nombre_usuario = ?', [usuario], async (error, results) => {
        if (error) return res.status(500).json({ success: false, message: 'Error en el servidor' });

        if (results.length === 0) return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        
        const usuarioDB = results[0];
        const contraseñaValida = contrasenia === usuarioDB.contrasenia;
        
        if (!contraseñaValida) return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });

        req.session.user = {
            id: usuarioDB.id_usuario,
            nombre: usuarioDB.nombre_usuario
        };

        res.json({ success: true });
    });
});

//Ruta para almacenar usuario
app.get('/usuario', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    res.json({ success: true, nombre: req.session.user.nombre });
});

// Ruta protegida para la página home
app.get('/home', (req, res) => {
    console.log('Chaval logeado:', req.session.user);
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
