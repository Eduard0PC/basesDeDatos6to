
// PARA EL MANEJO DEL QR
//npm install qrcode (INSTALAR EN EL SERVIDOR)

const express = require('express');
const QRCode = require('qrcode');

const router = express.Router();

router.post('/generate-qr', async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'ID de empleado requerido' });
    }
    try {
        const qrData = await QRCode.toDataURL(id);
        res.json({ qrCode: qrData });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar el QR' });
    }
});

module.exports = router;