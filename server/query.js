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

//ver todas las ventas
router.post('/see-ventas', (req, res) => {
    const connection = getConnection();
    connection.query(`
        SELECT id_pedido, id_alimento, total_pedido 
        FROM Pedidos`,
        (error, results)=>{
        res.json({title: "Control de ventas", header:["ID del sistema","ID del alimento", "total del pedido"], dbresults: results});
        connection.end();
    });
});

//ver todos los insumos
router.post('/see-insumos', (req, res) => {
    const connection = getConnection();
    connection.query(`
        SELECT id_insumo, nombre_insumo, unidad_medida 
        FROM Insumos`,
        (error, results)=>{
        res.json({title: "Control de insumos", header:["ID del sistema","Nombre", "Unidad de medida"], dbresults: results});
        connection.end();
    });
});

//Funciones macros

module.exports = router;
