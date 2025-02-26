
// PARA EL MANEJO DEL QR (NO IMPLEMENTADO EN EL FRONTEND)
//npm install qrcode

const express = require('express');
const QRCode = require('qrcode');
const { getConnection } = require('../db');

const router = express.Router();

router.get('/qr/:id', async (req, res) => {
    const { id } = req.params;
    const connection = getConnection();

    // Buscar usuario en la base de datos
    connection.query('SELECT nombre_usuario FROM UsuariosNom WHERE id_usuario = ?', [id], async (error, results) => {
        if (error || results.length === 0) {
            connection.end();
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const usuario = results[0].nombre_usuario;
        const qrData = `https://tusitio.com/perfil/${id}`; // URL a la que apuntará el QR

        try {
            const qrCode = await QRCode.toDataURL(qrData); // Genera el QR en formato base64
            res.json({ success: true, usuario, qr: qrCode });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error al generar QR' });
        }

        connection.end();
    });
});

module.exports = router;
