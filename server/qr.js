
// PARA EL MANEJO DEL QR
//npm install qrcode (INSTALAR EN EL SERVIDOR)

const express = require('express');
const QRCode = require('qrcode');
const router = express.Router();
const {getConnection} = require('./db'); // Conección a la base de datos


//Generar el QR de un empleado en específico
router.post('/generate-qr', async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'ID de empleado requerido' });
    }
    try {
        const qrData = await QRCode.toDataURL(id); //Genera QR
        res.json({ qrCode: qrData }); 
    } catch (error) {
        res.status(500).json({ error: 'Error al generar el QR' });
    }
});

// Chequeo del QR escaneado
router.post('/insert-horario', (req, res) => {
    console.log("Datos recibidos:", req.body);
    const { id } = req.body;  // El ID viene del QR escaneado
    if (!id) {
        return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    const connection = getConnection();
    //Chequeo si hay una entrada 
    const checkQuery = `
        SELECT id, hora_entrada, hora_salida 
        FROM RegistroHorario 
        WHERE id_usuario = ? 
        ORDER BY hora_entrada DESC 
        LIMIT 1`;
    const query = `
        INSERT INTO RegistroHorario (id_usuario, entrada)
        VALUES (?, NOW())`; // 'NOW()' captura la hora actual

    connection.query(query, [id], (error, results) => {
        if (error) {
            console.error("Error al insertar en RegistroHorario:", error);
            res.status(500).json({ error: "Error al registrar la entrada" });
        } else {
            res.json({ message: "Entrada registrada correctamente" });
        }
        connection.end();
    });
});

module.exports = router;