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
        SELECT t.id_registro, t.id_usuario, u.nombre_usuario, t.entrada, t.salida
        FROM RegistroHorario t, UsuariosNom u
        WHERE t.id_usuario=u.id_usuario`,
        (error, results)=>{
        res.json({title: "Registro de entradas y salidas de empleados", header:["ID del sistema" ,"ID Usuario", "Nombre", "Entrada", "Salida"], dbresults: results});
        connection.end();
    });
});

//ver el registro de empleados al trabajo
router.post('/see-track-empleados', (req, res) => {
    const connection = getConnection();
    connection.query(`
        SELECT tr.id_registro, tr.id_usuario, u.nombre_usuario, r.rol, tr.seccion, tr.accion, tr.hora
        FROM Registro tr, UsuariosNom u, UsuariosRol r
        WHERE tr.id_usuario=u.id_usuario AND tr.id_usuario=r.id_usuario`,
        (error, results)=>{
        res.json({title: "Historial de empleados", header:["ID del sistema" ,"ID Usuario", "Nombre", "Rol", "Sección", "Acción", "Hora"], dbresults: results});
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
        res.json({message: "Usuario eliminado", success: true, del_id: cid});
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error al eliminar usuario", success: false, del_id: cid});
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
        res.json({message: "Usuario añadido", success: true, new_id: tid});
    } catch (error) {
        console.error("Error al agregar usuario:", error);
        res.status(500).json({ error: "Error al agregar usuario", success: false});
    } finally {
        connection.end();
    }
});
//Monitorear un usuario
router.post('/track-user', async (req, res)=> {
    const {id, section, action} = req.body;
    const connection = getConnection();
    const query = util.promisify(connection.query).bind(connection)
    try{
        const q1 = await query(
            `INSERT INTO Registro(id_usuario, seccion, accion, hora) 
            VALUES (?,?,?,NOW())`
            , [id, section, action]);
        res.json({message: "Usuario monitoreado"});
    } catch (error) {
        console.error("Error al monitorear usuario:", error);
        res.status(500).json({ error: "Error al monitorear usuario" });
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
        const q1 = await query(
            `INSERT INTO Alimentos (nombre_alimento, precio)
            VALUES (?, ?)`,
            [nombre_alimento, precio_alimento]
        );
        const newID = q1.insertId;
        res.json({ message: "Plato añadido correctamente", success: true, new_id: newID});
    } catch (error) {
        console.error("Error al agregar plato:", error);
        res.status(500).json({ error: "Error al agregar plato", success: false});
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

        res.json({ message: "Plato actualizado correctamente", success: true, mod_id: id_alimento});
    } catch (error) {
        console.error("Error al actualizar plato:", error);
        res.status(500).json({ error: "Error al actualizar plato", success: false, mod_id: id_alimento});
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

        res.json({ message: "Plato y sus referencias eliminados correctamente", success: true, del_id: id_alimento});
    } catch (error) {
        console.error("Error al eliminar plato y sus referencias:", error);
        res.status(500).json({ error: "Error al eliminar plato y sus referencias", success: false, del_id: id_alimento});
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
        SELECT pd.id_pedido, pd.hora_pedido, SUM(p.total_pedido) AS total_pedido
        FROM PedidoDetalles pd
        JOIN Pedidos p ON pd.id_pedido = p.id_pedido
        GROUP BY pd.id_pedido, pd.hora_pedido
        ORDER BY pd.id_pedido DESC
        LIMIT 10`,
        (error, results)=>{
        res.json({title: "Pedidos en Curso", header:["ID Pedido","Hora del pedido","Total del pedido ($)"], dbresults: results});
        connection.end();
    });
});

// Fetch pedido details by id_pedido
router.post('/get-pedido-details', async (req, res) => {
    const { id_pedido } = req.body;
    const connection = getConnection();
    const query = util.promisify(connection.query).bind(connection);

    try {
        const results = await query(
            `SELECT p.id_pedido, p.nombre_cliente, p.direccion, a.nombre_alimento, p.cantidad_alimento, p.total_pedido
            FROM Pedidos p
            JOIN Alimentos a ON p.id_alimento = a.id_alimento
            WHERE p.id_pedido = ?`,
            [id_pedido]
        );

        res.json({
            title: "Detalles del Pedido",
            header: ["ID pedido", "Nombre del cliente", "Dirección del cliente", "Nombre del Alimento", "Cantidad", "Total"],
            dbresults: results
        });
    } catch (error) {
        console.error("Error al obtener detalles del pedido:", error);
        res.status(500).json({ error: "Error al obtener detalles del pedido" });
    } finally {
        connection.end();
    }
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

        res.json({ message: "Pedido añadido correctamente", success: true, new_id: id_pedido});
    } catch (error) {
        console.error("Error al añadir pedido:", error);
        res.status(500).json({ error: "Error al añadir pedido", success: false});
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

        res.json({ message: "Pedido eliminado correctamente", success: true, del_id: id_pedido});
    } catch (error) {
        console.error("Error al eliminar pedido:", error);
        res.status(500).json({ error: "Error al eliminar pedido", success: false, del_id: id_pedido});
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
                return res.status(500).json({error: "Error fetching insumos"});
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
        res.json({message: "Insumo añadido correctamente", success: true, new_id: id_insumo});
    } catch (error) {
        console.error("Error al agregar insumo:", error);
        res.status(500).json({error: "Error al agregar insumo", success: false});
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
        res.json({ message: "Insumo actualizado correctamente", success: true, mod_id: id_insumo});
    } catch (error) {
        console.error("Error al actualizar insumo:", error);
        res.status(500).json({ error: "Error al actualizar insumo", success: false, mod_id: id_insumo});
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

        res.json({ message: "Insumo eliminado correctamente", success: true, del_id: id_insumo});
    } catch (error) {
        console.error("Error al eliminar insumo:", error);
        res.status(500).json({ error: "Error al eliminar insumo", sucess: false, del_id: id_insumo});
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
