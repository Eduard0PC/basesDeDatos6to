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

//----------------------------------------CONSULTAS DE EMPLEADOS-------------------------------------------
//ver todos los empleados con rol
router.post('/see-empleados', (req, res) => {
    const connection = getConnection();
    connection.query(`
        SELECT u.id_usuario, u.nombre_usuario, u.contrasenia, u.h_entrada, u.h_salida, r.rol 
        FROM UsuariosNom u, UsuariosRol r 
        WHERE u.id_usuario=r.id_usuario`,
        (error, results)=>{
        res.json({title: "Control de empleados", header:["ID del sistema","Nombre", "Contraseña", "Horario de entrada", "Horario de salida", "Rol"], dbresults: results});
        connection.end();
    });
});

//ver el registro de empleados al trabajo
router.post('/see-time-empleados', (req, res) => {
    const connection = getConnection();
    connection.query(`
        SELECT *
        FROM RegistroHorario`,
        (error, results)=>{
        res.json({title: "Registro de entradas y salidas de empleados", header:["ID del sistema" ,"Nombre", "Entrada", "Salida"], dbresults: results});
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

//Añadir un usuario
router.post('/add-user', async (req, res)=> {
    const {username, pswd, role, hinit, hfinale} = req.body;
    const connection = getConnection();
    const query = util.promisify(connection.query).bind(connection)
    try{
        const q1 = await query(
            `INSERT INTO UsuariosNom(nombre_usuario, contrasenia, h_entrada, h_salida) 
            VALUES (?,?,?,?)`
            , [username, pswd, hinit, hfinale]);
        const tid = q1.insertId;
        const q2 = await query(
            `INSERT INTO UsuariosRol 
            VALUES (?, ?)`
            , [tid, role]);
        res.json({message: "Usuario añadido"});
    } catch (error) {
        console.error("Error al agregar usuario:", error);
        res.status(500).json({ error: "Error al agregar usuario" });
    } finally {
        connection.end();
    }
});

//-----------------------------------------CONSULTAS DE VENTAS---------------------------------------------
//ver todas las ventas
router.post('/see-ventas', (req, res) => {
    const connection = getConnection();
    connection.query(`
        SELECT id_alimento, nombre_alimento, precio
        FROM Alimentos`,
        (error, results)=>{
        res.json({title: "Menú de platillos", header:["ID del alimento", "Nombre del alimento", "Precio",], dbresults: results});
        connection.end();
    });
});

router.post('/add-ventas', async (req, res) => {
    const { nombre_alimento, precio_alimento } = req.body;
    const connection = getConnection();
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Insert into Alimentos table
        await query(
            `INSERT INTO Alimentos (nombre_alimento, precio)
            VALUES (?, ?)`,
            [nombre_alimento, precio_alimento]
        );

        res.json({ message: "Plato añadido correctamente" });
    } catch (error) {
        console.error("Error al agregar plato:", error);
        res.status(500).json({ error: "Error al agregar plato" });
    } finally {
        connection.end();
    }
});

// Edit an insumo
router.post('/edit-ventas', async (req, res) => {
    const { id_alimento, nombre_alimento, precio_alimento } = req.body;
    const connection = getConnection();
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Update Alimentos table
        await query(
            `UPDATE Alimentos
            SET nombre_alimento = ?, precio = ?
            WHERE id_alimento = ?`,
            [nombre_alimento, precio_alimento, id_alimento]
        );

        res.json({ message: "Plato actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar plato:", error);
        res.status(500).json({ error: "Error al actualizar plato" });
    } finally {
        connection.end();
    }
});

// Delete an insumo
router.post('/delete-ventas', async (req, res) => {
    const { id_alimento } = req.body;
    const connection = getConnection();
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Delete related rows from Pedidos table
        await query(
            `DELETE FROM Pedidos
            WHERE id_alimento = ?`,
            [id_alimento]
        );

        // Delete orphaned rows from PedidoDetalles table
        await query(
            `DELETE FROM PedidoDetalles
            WHERE id_pedido NOT IN (SELECT DISTINCT id_pedido FROM Pedidos)`
        );

        // Delete the alimento from Alimentos table
        await query(
            `DELETE FROM Alimentos
            WHERE id_alimento = ?`,
            [id_alimento]
        );

        res.json({ message: "Plato y sus referencias eliminados correctamente" });
    } catch (error) {
        console.error("Error al eliminar plato y sus referencias:", error);
        res.status(500).json({ error: "Error al eliminar plato y sus referencias" });
    } finally {
        connection.end();
    }
});

// Search for an insumo
router.post('/search-ventas', (req, res) => {
    const { searchTerm } = req.body;

    const connection = getConnection();
    let query;
    let params;

    if (!searchTerm || searchTerm.trim() === "") {
        // Query all alimentos if no search term is provided
        query = `
            SELECT id_alimento, nombre_alimento, precio
            FROM Alimentos`;
        params = [];
    } else {
        // Query alimentos by name or ID
        query = `
            SELECT id_alimento, nombre_alimento, precio
            FROM Alimentos
            WHERE nombre_alimento LIKE ? OR id_alimento = ?`;
        const isNumeric = !isNaN(searchTerm);
        params = [`%${searchTerm}%`, isNumeric ? Number(searchTerm) : null];
    }

    connection.query(query, params, (error, results) => {
        if (error) {
            console.error("Error searching alimentos:", error);
            return res.status(500).json({ error: "Error searching alimentos" });
        }

        // No need for stock flags here since it's not relevant for alimentos
        res.json({
            title: searchTerm ? "Resultados de búsqueda" : "Todos los platos",
            header: ["ID del alimento", "Nombre del alimento", "Precio"],
            dbresults: results
        });
        connection.end();
    });
});

//-----------------------------------------CONSULTAS DE PEDIDOS-------------------------------------------
//ver los pedidos más recientes

router.post('/see-pedidos', (req, res)=>{
    const connection = getConnection();
    connection.query(`
        SELECT u.id_pedido, r.nombre_cliente, u.hora_pedido, r.direccion
        FROM PedidoDetalles u, Pedidos r 
        WHERE u.id_pedido = r.id_pedido
        ORDER BY u.hora_pedido
        LIMIT 5`,
        (error, results)=>{
        res.json({title: "Pedidos en Curso", header:["ID Pedido","Cliente", "Hora", "Dirección"], dbresults: results});
        connection.end();
    });
});

router.post('/add-pedido', async (req, res) => {
    const { nombre_cliente, direccion, alimentos } = req.body;
    const connection = getConnection();
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Insert into PedidoDetalles
        const pedidoDetallesResult = await query(
            `INSERT INTO PedidoDetalles (fecha_pedido, hora_pedido)
            VALUES (NOW(), NOW())`
        );
        const id_pedido = pedidoDetallesResult.insertId;

        // Insert into Pedidos
        for (const alimento of alimentos) {
            await query(
                `INSERT INTO Pedidos (id_pedido, id_alimento, cantidad_alimento, total_pedido, direccion, nombre_cliente)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [id_pedido, alimento.id_alimento, alimento.cantidad, alimento.total, direccion, nombre_cliente]
            );
        }

        res.json({ message: "Pedido añadido correctamente" });
    } catch (error) {
        console.error("Error al añadir pedido:", error);
        res.status(500).json({ error: "Error al añadir pedido" });
    } finally {
        connection.end();
    }
});

// Delete a pedido
router.post('/delete-pedido', async (req, res) => {
    const { id_pedido } = req.body;
    const connection = getConnection();
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Delete from Pedidos table
        await query(
            `DELETE FROM Pedidos
            WHERE id_pedido = ?`,
            [id_pedido]
        );

        // Delete from PedidoDetalles table
        await query(
            `DELETE FROM PedidoDetalles
            WHERE id_pedido = ?`,
            [id_pedido]
        );

        res.json({ message: "Pedido eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar pedido:", error);
        res.status(500).json({ error: "Error al eliminar pedido" });
    } finally {
        connection.end();
    }
});

// Fetch all alimentos for the dropdown
router.get('/get-alimentos', (req, res) => {
    const connection = getConnection();
    connection.query(`
        SELECT id_alimento, nombre_alimento, precio
        FROM Alimentos`,
        (error, results) => {
            if (error) {
                console.error("Error fetching alimentos:", error);
                return res.status(500).json({ error: "Error fetching alimentos" });
            }

            res.json(results);
            connection.end();
        });
});

//-------------------------------------------CONSULTAS INSUMOS---------------------------------------------
//ver todos los insumos
router.post('/see-insumos', (req, res) => {
    const connection = getConnection();
    connection.query(`
        SELECT u.id_insumo, u.nombre_insumo, r.cantidad, u.unidad_medida
        FROM Insumos u
        LEFT JOIN VencInsumos r ON u.id_insumo = r.id_insumo
        ORDER BY r.cantidad ASC`,
        (error, results) => {
            if (error) {
                console.error("Error fetching insumos:", error);
                return res.status(500).json({ error: "Error fetching insumos" });
            }

            // Add stock flags
            const updatedResults = results.map(item => ({
                ...item,
                noStock: item.cantidad === 0,
                isLowStock: item.cantidad > 0 && item.cantidad < 10,
                isMedStock: item.cantidad >= 10 && item.cantidad < 50,
                isHighStock: item.cantidad >= 50
            }));

            res.json({
                title: "Control de insumos",
                header: ["ID del sistema", "Nombre", "Cantidad restante", "Unidad de medida"],
                dbresults: updatedResults
            });
            connection.end();
        });
});

router.post('/add-insumos', async (req, res)=> {
    const {nombre_insumo, unidad_medida, caducidad, cantidad} = req.body;
    const connection = getConnection();
    const query = util.promisify(connection.query).bind(connection)
    try{
        const q1 = await query(
            `INSERT INTO Insumos (nombre_insumo, unidad_medida)
            VALUES (?,?)`
            , [nombre_insumo, unidad_medida]);
        const id_insumo = q1.insertId;
        await query(
            `INSERT INTO VencInsumos (id_insumo, caducidad, cantidad)
            VALUES (?, ?, ?)`
            , [id_insumo, caducidad, cantidad]);
        res.json({message: "Insumo añadido correctamente"});
    } catch (error) {
        console.error("Error al agregar insumo:", error);
        res.status(500).json({ error: "Error al agregar insumo" });
    } finally {
        connection.end();
    }
});

// Edit an insumo
router.post('/edit-insumos', async (req, res) => {
    const { id_insumo, nombre_insumo, unidad_medida, caducidad, cantidad } = req.body;
    const connection = getConnection();
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Update Insumos table
        await query(
            `UPDATE Insumos
            SET nombre_insumo = ?, unidad_medida = ?
            WHERE id_insumo = ?`,
            [nombre_insumo, unidad_medida, id_insumo]
        );

        // Update VencInsumos table
        await query(
            `UPDATE VencInsumos
            SET caducidad = ?, cantidad = ?
            WHERE id_insumo = ?`,
            [caducidad, cantidad, id_insumo]
        );

        res.json({ message: "Insumo actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar insumo:", error);
        res.status(500).json({ error: "Error al actualizar insumo" });
    } finally {
        connection.end();
    }
});

// Delete an insumo
router.post('/delete-insumos', async (req, res) => {
    const { id_insumo } = req.body;
    const connection = getConnection();
    const query = util.promisify(connection.query).bind(connection);

    try {
        // Delete from VencInsumos table
        await query(
            `DELETE FROM VencInsumos
            WHERE id_insumo = ?`,
            [id_insumo]
        );

        // Delete from Insumos table
        await query(
            `DELETE FROM Insumos
            WHERE id_insumo = ?`,
            [id_insumo]
        );

        res.json({ message: "Insumo eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar insumo:", error);
        res.status(500).json({ error: "Error al eliminar insumo" });
    } finally {
        connection.end();
    }
});

// Search for an insumo
router.post('/search-insumos', (req, res) => {
    const { searchTerm } = req.body;

    const connection = getConnection();
    let query;
    let params;

    if (!searchTerm || searchTerm.trim() === "") {
        query = `
            SELECT u.id_insumo, u.nombre_insumo, r.cantidad, u.unidad_medida
            FROM Insumos u
            LEFT JOIN VencInsumos r ON u.id_insumo = r.id_insumo
            ORDER BY r.cantidad ASC`;
        params = [];
    } else {
        query = `
            SELECT u.id_insumo, u.nombre_insumo, r.cantidad, u.unidad_medida
            FROM Insumos u
            LEFT JOIN VencInsumos r ON u.id_insumo = r.id_insumo
            WHERE u.nombre_insumo LIKE ? OR u.id_insumo = ?
            ORDER BY r.cantidad ASC`;
        const isNumeric = !isNaN(searchTerm);
        params = [`%${searchTerm}%`, isNumeric ? Number(searchTerm) : null];
    }

    connection.query(query, params, (error, results) => {
        if (error) {
            console.error("Error searching insumos:", error);
            return res.status(500).json({ error: "Error searching insumos" });
        }

        const updatedResults = results.map(item => ({
            ...item,
            noStock: item.cantidad === 0,
            isLowStock: item.cantidad > 0 && item.cantidad < 10,
            isMedStock: item.cantidad >= 10 && item.cantidad < 50,
            isHighStock: item.cantidad >= 50
        }));

        res.json({
            title: searchTerm ? "Resultados de búsqueda" : "Todos los insumos",
            header: ["ID del sistema", "Nombre", "Cantidad restante", "Unidad de medida"],
            dbresults: updatedResults
        });
        connection.end();
    });
});

//Funciones macros

module.exports = router;
