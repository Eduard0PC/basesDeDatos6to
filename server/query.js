//EN ESTE ARCHIVO SE MANEJARAN LAS CONSULTAS GENERALES NO RELACIONADAS CON LA SESION
//SE PONE EN SERVER PARA PREVENIR ALGÚN INTENTO DE INYECCIÓN SQL
const express = require('express');
const router = express.Router();
const { getConnection } = require('./db');
const path = require('path');
const util = require('util');

// Página principal
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

//------------------------------------CONSULTAS DE EMPLEADOS------------------------------------

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

//Eliminar un usuario
router.post('/delete-user', async (req, res)=> {
    const { id } = req.body;
    const cid = Number([id]);
    const connection = getConnection();
    const query = util.promisify(connection.query).bind(connection)
    try{
        const q2 = await query(
            `DELETE FROM UsuariosRol
            WHERE id_usuario = ? `
            , cid);
        const q1 = await query(
            `DELETE FROM UsuariosNom
            WHERE id_usuario = ? `
            , cid);
        res.json({message: "Usuario eliminado"});
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error al eliminar usuario" });
    } finally {
        connection.end();
    }
});

//------------------------------------CONSULTAS DE VENTAS/PEDIDOS------------------------------------

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
