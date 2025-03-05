
//MANEJO DEL DEL LOGIN Y LOGOUT

const express = require('express');
const router = express.Router();
const { getConnection } = require('./db');
const path = require('path');

// Página de inicio de sesión
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Login
router.post('/login', (req, res) => {
    const { usuario, contrasenia } = req.body;
    const connection = getConnection();
    //Depuración para conexión de base de datos
    /*
    connection.connect((err)=>{
        if(err){
            console.error('Error de conexión a la base de datos', err);
        }else{
            console.error('Conexión exitosa');
        }
    });
    */
    connection.query(`
        SELECT u.id_usuario, u.nombre_usuario, u.contrasenia, r.rol 
        FROM UsuariosNom u
        LEFT JOIN UsuariosRol r ON u.id_usuario = r.id_usuario
        WHERE u.nombre_usuario = ?
    `, [usuario], (error, results) => {
        if (error) {
            connection.end();
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }

        if (results.length === 0) {
            connection.end();
            return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }

        const usuarioDB = results[0];
        const contraseñaValida = contrasenia === usuarioDB.contrasenia;

        if (!contraseñaValida) {
            connection.end();
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }

        req.session.user = {
            id: usuarioDB.id_usuario,
            nombre: usuarioDB.nombre_usuario,
            rol: usuarioDB.rol || 'Sin rol'
        };

        connection.end();
        res.json({ success: true });

        // Cerrar sesión automáticamente después de 10 minutos
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

// Logout
router.post('/logout', (req, res) => {
    const usuario = req.session.user ? req.session.user.nombre : 'Usuario desconocido';
    
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
        }
        console.log(`Sesión cerrada para: ${usuario}`);
        res.json({ success: true });
    });
});

module.exports = router;
