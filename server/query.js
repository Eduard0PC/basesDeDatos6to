//EN ESTE ARCHIVO SE MANEJARAN LAS CONSULTAS GENERALES NO RELACIONADAS CON LA SESION
//SE PONE EN SERVER PARA PREVENIR ALGÚN INTENTO DE INYECCIÓN SQL
const express = require('express');
const router = express.Router();
const { getConnection } = require('./db');
const path = require('path');
// Página principal
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

//ver los pedidos más recientes
router.post('/see-pedidos', (req, res)=>{
    const connection = getConnection();
    connection.query(`
        SELECT *
        FROM PedidoDetalles 
        ORDER BY hora_pedido
        LIMIT 5`,
        (error, results)=>{
        res.json({title: "Pedidos en Curso", header:["ID Pedido","Cliente", "Hora"], dbresults: results});
        connection.end();
    });
});
//ver todos los empleados con rol
router.post('/see-empleados', (req, res) => {
    const connection = getConnection();
    connection.query(`
        SELECT u.id_usuario, u.nombre_usuario, u.contrasenia, r.rol 
        FROM UsuariosNom u, UsuariosRol r 
        WHERE u.id_usuario=r.id_usuario`,
        (error, results)=>{
        res.json({title: "Control de empleados", header:["ID del sistema","Nombre", "Contraseña", "Rol"], dbresults: results});
        connection.end();
    });
});
//Funciones macros

module.exports = router;
