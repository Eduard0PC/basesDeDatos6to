const express = require('express');
const session = require('express-session');
//const bcryptjs = require('bcryptjs'); para encriptar contraseñas pero no se usara de mientras
const { getConnection } = require('./db');
const app = express();
const path = require('path'); //para poder usar navegar fuera de server
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//----------------------------------------------------------------------------------------------------------------LOGIN
// Ruta para la página de inicio de sesión
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Ruta para validar el login
app.post('/login', (req, res) => {
    const { usuario, contrasenia } = req.body;
    const connection = getConnection(); // Abre conexión

    connection.query('SELECT * FROM UsuariosNom WHERE nombre_usuario = ?', [usuario], (error, results) => {
        if (error) {
            connection.end(); // Cierra conexión
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            connection.end(); // Cierra conexión
            return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }

        const usuarioDB = results[0];
        const contraseñaValida = contrasenia === usuarioDB.contrasenia;

        if (!contraseñaValida) {
            connection.end(); // Cierra conexión
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }

        req.session.user = {
            id: usuarioDB.id_usuario,
            nombre: usuarioDB.nombre_usuario
        };

        connection.end(); // Cierra conexión
        res.json({ success: true });

         // Cerrar la sesión después de 10 minutos
        setTimeout(() => {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error al cerrar sesión automáticamente:', err);
                } else {
                    console.log('Sesión cerrada automáticamente por inactividad.');
                }
            });
        }, 600000); // 10 minutos
    });
});

//Ruta para almacenar usuario
app.get('/usuario', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    res.json({ success: true, nombre: req.session.user.nombre });
});

//----------------------------------------------------------------------------------------------------------------LOGOUT
app.post('/logout', (req, res) => {
    const usuario = req.session.user ? req.session.user.nombre : 'Usuario desconocido';
    
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
        }
        console.log(`Sesión cerrada para: ${usuario}`);
        res.json({ success: true });
    });
});

// Ruta protegida para la página home
app.get('/home', (req, res) => {
    console.log('Chaval logeado:', req.session.user);
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

