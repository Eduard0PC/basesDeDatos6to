
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

    // Verificar si hay entradas sin salidas
    const checkQuery = `
        SELECT id_registro 
        FROM RegistroHorario 
        WHERE id_usuario = ? AND salida IS NULL 
        ORDER BY entrada DESC 
        LIMIT 1`;

    connection.query(checkQuery, [id], (error, results) => {
        if (error) {
            console.error("Error al verificar registro:", error);
            res.status(500).json({ error: "Error al verificar registro" });
            connection.end();
            return;
        }

        if (results.length > 0) {
            // insertar salida
            const registroId = results[0].id_registro;
            const updateQuery = `
                UPDATE RegistroHorario 
                SET salida = NOW() 
                WHERE id_registro = ?`;

            connection.query(updateQuery, [registroId], (error, updateResults) => {
                if (error) {
                    console.error("Error al actualizar salida:", error);
                    res.status(500).json({ error: "Error al registrar salida" });
                } else {
                    res.json({ message: "Salida registrada correctamente" });
                }
                connection.end();
            });
        } else {
            // Si no hay entrada se registra
            const insertQuery = `
                INSERT INTO RegistroHorario (id_usuario, entrada)
                VALUES (?, NOW())`;

            connection.query(insertQuery, [id], (error, insertResults) => {
                if (error) {
                    console.error("Error al insertar entrada:", error);
                    res.status(500).json({ error: "Error al registrar entrada" });
                } else {
                    res.json({ message: "Entrada registrada correctamente" });
                }
                connection.end();
            });
        }
    });
});

module.exports = router;