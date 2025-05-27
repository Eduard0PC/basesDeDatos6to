
// MANEJA LOS USUARIOS QUE SE LOGEAN

const express = require('express');
const router = express.Router();
const path = require('path');

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/');  // Redirige a la página de inicio de sesión
        //return res.status(401).json({sucess: false, message: "Usuario no autenticado"}); //Devuelve un json
    }
    next();
};

// Obtener información del usuario autenticado
router.get('/usuario', authMiddleware, (req, res) => {
    res.json({ success: true, id: req.session.user.id, nombre: req.session.user.nombre, rol: req.session.user.rol });
});

// Ruta protegida para la página home
router.get('/home', authMiddleware, (req, res) => {
    console.log('Fulano que entro:', req.session.user);
    res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

module.exports = router;
